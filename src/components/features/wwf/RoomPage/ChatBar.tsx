import CommentInput from "@/components/features/comment/CommentInput";
import CircleButton from "@/components/shared/CircleButton";
import TransLink from "@/components/shared/TransLink";
import { useRoomInfo } from "@/contexts/RoomContext";
import { useRoomState } from "@/contexts/RoomStateContext";
import { Chat as ChatType, ChatEvent, ChatMessage } from "@/types";
import { Trans, useTranslation } from "next-i18next";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MobileView } from "react-device-detect";
import { AiOutlineClose } from "react-icons/ai";
import Chat from "./Chat";

const ChatBar = () => {
  const { t } = useTranslation("wwf");
  const { state, setState } = useRoomState();
  const { socket } = useRoomInfo();
  const [chats, setChats] = useState<ChatType[]>([]);
  const messageBottomRef = useRef<HTMLDivElement>();

  useEffect(() => {
    socket.on("message", (message: ChatMessage) => {
      setChats((prev) => [...prev, { ...message, type: "message" }]);

      messageBottomRef.current?.scrollIntoView();
    });

    socket.on("event", (event: ChatEvent) => {
      setChats((prev) => [...prev, { ...event, type: "event" }]);
    });

    return () => {
      socket.off("message");
      socket.off("event");
    };
  }, [socket]);

  const handleSendMessage = useCallback(
    (text: string) => {
      socket.emit("sendMessage", text);
    },
    [socket]
  );

  return (
    state.isChatBarOpen && (
      <div className="relative w-full md:w-[25%] flex flex-col p-4 h-full bg-background-800">
        <MobileView renderWithFragment>
          <CircleButton
            secondary
            LeftIcon={AiOutlineClose}
            className="absolute right-2"
            onClick={() => {
              setState((prev) => ({ ...prev, isChatBarOpen: false }));
            }}
          />
        </MobileView>

        <p className="text-center font-medium py-2 border-b border-gray-600">
          {t("chat_bar_heading")}
        </p>

        <div className="grow py-4 space-y-2 overflow-y-auto no-scrollbar">
          {chats.map((chat, index) => (
            <Chat chat={chat} key={index} />
          ))}

          <div ref={messageBottomRef}></div>
        </div>

        <CommentInput
          placeholder="Aa"
          needLoginMessage={
            <p className="text-gray-300">
              <Trans i18nKey="wwf:chat_bar_need_login">
                Bạn phải{" "}
                <TransLink
                  href="/login"
                  className="text-primary-300 hover:underline"
                >
                  đăng nhập
                </TransLink>{" "}
                dể nhắn tin.
              </Trans>
            </p>
          }
          showAvatar={false}
          onEnter={handleSendMessage}
        />
      </div>
    )
  );
};

export default React.memo(ChatBar);
