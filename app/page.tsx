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
import { speakWithVoiceVox } from "@/utils/voicevoxClient";

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

  // 再生中の Audio インスタンスを保持して、途中停止できるようにするための参照です。
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // SpeechRecognition インスタンスは1つにしておきたいので useMemo でラップします。
  const speechController = useMemo(
    () =>
      createSpeechRecognition({
        onResult: (text) => {
          // 音声認識が完了したときに呼ばれます。
          setInputText(text);
          setIsRecognizing(false);
          setStatus("thinking");
          void handleSendMessage(text);
        },
        onStart: () => {
          setIsRecognizing(true);
          setStatus("listening");
        },
        onEnd: () => {
          setIsRecognizing(false);
          // onResult 側でステータスを更新するので、ここでは待機に戻すだけにします。
          if (status === "listening") {
            setStatus("idle");
          }
        },
        onError: () => {
          setIsRecognizing(false);
          setStatus("idle");
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
      const audio = await speakWithVoiceVox(aiText, { speed });
      if (audio) {
        // 途中停止できるように参照を保存しておきます。
        currentAudioRef.current = audio;
        audio.onended = () => {
          currentAudioRef.current = null;
          setStatus("idle");
        };
      } else {
        setStatus("idle");
      }
    } else {
      setStatus("idle");
    }

    setIsBusy(false);
  };

  // 「話す」ボタンを押したときの処理です。
  const handleStartSpeech = () => {
    if (!speechController.isSupported) {
      // 非対応ブラウザでは、テキスト入力を案内するだけにします。
      alert(
        "このブラウザでは マイクでの 音声認識が つかえないみたいです。\nしたの 文字いれ を つかって おはなし してみてね。"
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

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }

    setIsBusy(false);
    setIsRecognizing(false);
    setStatus("idle");
  };

  const handleSubmitText = () => {
    void handleSendMessage();
  };

  return (
    <main className="bg-white/80 rounded-3xl shadow-xl border-2 border-ohanashi-orange-100 p-4 sm:p-6 space-y-4 sm:space-y-6">
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

      <div className="flex items-center justify-between">
        <StatusIndicator status={status} />
      </div>

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
  );
}

