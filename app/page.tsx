"use client";

import React, { useMemo, useRef, useState } from "react";

import { CharacterSelector, type CharacterId } from "@/components/CharacterSelector";
import { CharacterAvatar, type ConversationStatus } from "@/components/CharacterAvatar";
import { ConversationPanel } from "@/components/ConversationPanel";
import { TextInputArea } from "@/components/TextInputArea";
import { StatusIndicator } from "@/components/StatusIndicator";
import { ControlPanel, type ReplyMode } from "@/components/ControlPanel";
import { createSpeechRecognition } from "@/utils/speechRecognition";
import { sendChat } from "@/utils/chatClient";
import { createVoicePlayer, type VoicePlaybackHandle } from "@/utils/voicevoxClient";

export default function HomePage() {
  // キャラクター選択（はなちゃん / 近所の女性 / おじさま）
  const [character, setCharacter] = useState<CharacterId>("hana");
  // 返信モード（音声 / テキスト / 両方）
  const [replyMode, setReplyMode] = useState<ReplyMode>("both");
  // 会話ステータス（待機中 / 聞き取り中 / 考え中 / お話し中）
  const [status, setStatus] = useState<ConversationStatus>("idle");
  // 入力中/直近のユーザー発話テキスト
  const [inputText, setInputText] = useState("");
  // 直近のAI返答テキスト
  const [responseText, setResponseText] = useState("");
  // VOICEVOX に渡す速度（0.5〜2.0）
  const [speed, setSpeed] = useState(1.0);
  // 処理中フラグ（API呼び出し中や音声生成中など）
  const [isBusy, setIsBusy] = useState(false);
  // 音声認識対応状況
  const [isRecognizing, setIsRecognizing] = useState(false);
  // エラーや注意メッセージ（子ども向け・大人向けを混ぜて表示してOK）
  const [notice, setNotice] = useState<string>("");

  // 再生中の音声（VOICEVOX）のハンドルを保持して、途中停止できるようにするための参照です。
  const currentPlaybackRef = useRef<VoicePlaybackHandle | null>(null);

  // 音声プレイヤーは1つにして、最初のユーザー操作で unlock しておきます。
  const voicePlayer = useMemo(() => createVoicePlayer(), []);

  // SpeechRecognition インスタンスは1つにしておきたいので useMemo でラップします。
  const speechController = useMemo(
    () =>
      createSpeechRecognition({
        onResult: (text) => {
          // 音声認識が完了したときに呼ばれます。
          setInputText(text);
          setIsRecognizing(false);
          setStatus("thinking");
          setNotice("");
          void handleSendMessage(text);
        },
        onStart: () => {
          setIsRecognizing(true);
          setStatus("listening");
          setNotice("");
        },
        onEnd: () => {
          setIsRecognizing(false);
          // useMemo([]) の中では state が古くなることがあるため、
          // 直前の値を関数で見て安全に戻します。
          setStatus((prev) => (prev === "listening" ? "idle" : prev));
        },
        onError: (event) => {
          setIsRecognizing(false);
          setStatus("idle");
          // ブラウザのエラー内容はまちまちなので、まずは「よくある原因」を表示します。
          console.error("speech recognition error", event);
          setNotice(
            "マイクが つかえないみたい…。ブラウザの設定で マイクを許可して、もういちど『話す』をおしてね。（iPhoneのSafariは非対応のことがあります）"
          );
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // テキスト or 音声で取得したメッセージを、会話APIに送る共通処理です。
  const handleSendMessage = async (textOverride?: string) => {
    const text = (textOverride ?? inputText).trim();
    if (!text) {
      return;
    }

    // 連打防止と二重リクエスト防止
    if (isBusy) return;

    setIsBusy(true);
    setStatus("thinking");
    setResponseText("");
    setNotice("");

    const { text: aiText } = await sendChat({
      message: text,
      character,
      replyMode
    });

    // テキスト表示が有効なモードのときだけ画面に出します。
    if (replyMode === "text" || replyMode === "both") {
      setResponseText(aiText);
    }

    // 音声再生が必要な場合は VOICEVOX を呼び出します。
    if (replyMode === "voice" || replyMode === "both") {
      setStatus("speaking");
      // 音声が鳴らない端末があるため、未解除なら案内を出します。
      if (!voicePlayer.isUnlocked()) {
        setNotice(
          "音が出ないときは『話す』か『そうしん』をもういちど押して、音声の準備をしてね。"
        );
      }

      const playback = await voicePlayer.speak(aiText, { speed });
      if (!playback) {
        setStatus("idle");
        setNotice(
          "声の へんかん が うまくいかなかったみたい…。VOICEVOX の設定（URL/キー）を たしかめてね。"
        );
      } else {
        currentPlaybackRef.current = playback;
        // 再生が終わるまで待ってから待機に戻します。
        await playback.finished;
        currentPlaybackRef.current = null;
        setStatus("idle");
      }
    } else {
      setStatus("idle");
    }

    setIsBusy(false);
  };

  // 「話す」ボタンを押したときの処理です。
  const handleStartSpeech = async () => {
    // ここはユーザー操作直後なので、音声再生の解除（unlock）に最適です。
    await voicePlayer.unlock();

    if (!speechController.isSupported) {
      // 非対応ブラウザでは、テキスト入力を案内するだけにします。
      setNotice(
        "このブラウザでは マイクでの 音声認識が つかえないみたい…。したの『文字で はなす』で おはなし してみてね。（PCのChromeだと動きやすいよ）"
      );
      return;
    }

    speechController.start();
  };

  // 「とめる」ボタンを押したときの処理です。
  // 音声認識 / 再生中の音声 / 考え中の状態をすべてリセットします。
  const handleStopAll = () => {
    try {
      speechController.stop();
    } catch {
      // stop中のエラーは無視します。
    }

    // VOICEVOX の再生停止
    voicePlayer.stop();
    if (currentPlaybackRef.current) {
      currentPlaybackRef.current.stop();
      currentPlaybackRef.current = null;
    }

    setIsBusy(false);
    setIsRecognizing(false);
    setStatus("idle");
  };

  const handleSubmitText = async () => {
    // テキスト送信もユーザー操作なので、音声の unlock を先に行っておきます。
    await voicePlayer.unlock();
    void handleSendMessage();
  };

  return (
    <div className="relative">
      {/* 背景の飾り（にぎやかに見せるため） */}
      <div className="absolute -top-6 -right-6 w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-ohanashi-yellow-200 blur-2xl opacity-70" />
      <div className="absolute -bottom-8 -left-6 w-28 h-28 sm:w-44 sm:h-44 rounded-full bg-ohanashi-orange-200 blur-2xl opacity-70" />

      <main className="relative bg-white/85 backdrop-blur rounded-3xl shadow-2xl border-2 border-ohanashi-orange-100 p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm sm:text-base font-semibold text-ohanashi-orange-700">
              お話AI
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-ohanashi-orange-900">
              いっしょに おしゃべり しよう！
            </div>
          </div>
          <div className="shrink-0">
            <StatusIndicator status={status} />
          </div>
        </div>

        {/* 注意メッセージ */}
        {notice && (
          <div className="bg-ohanashi-yellow-50 border-2 border-ohanashi-yellow-200 text-ohanashi-orange-900 rounded-2xl p-3 sm:p-4 text-sm sm:text-base font-semibold">
            {notice}
          </div>
        )}

      {/* 上部: キャラクター表示 + キャラクター切り替え */}
      <div>
        <CharacterAvatar character={character} status={status} />
        <CharacterSelector value={character} onChange={setCharacter} />
      </div>

      {/* 中央: 発話内容と返答テキスト表示 */}
      <ConversationPanel inputText={inputText} responseText={responseText} />

      {/* テキスト入力欄 */}
      <TextInputArea
        value={inputText}
        onChange={setInputText}
        onSubmit={handleSubmitText}
        disabled={isBusy}
      />

      {/* 下部: 話す / とめる ボタン + モード & 速度 */}
      <ControlPanel
        status={status}
        replyMode={replyMode}
        onReplyModeChange={setReplyMode}
        speed={speed}
        onSpeedChange={setSpeed}
        onStartSpeaking={handleStartSpeech}
        onStopAll={handleStopAll}
        isRecognizing={isRecognizing}
        isBusy={isBusy}
      />
      </main>
    </div>
  );
}

