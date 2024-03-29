"use client";
import { cn, toPusherKey } from "@/lib/utils";
import { Message } from "@/lib/validations/message";
import { FC, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher";
interface MessagesProps {
  initialMessages: Message[];
  sessionId: string;
  sessionImg: string | null | undefined;
  chatPartner: User;
  chatId: string;
}
const Messages: FC<MessagesProps> = ({
  initialMessages,
  sessionId,
  chatPartner,
  sessionImg,
  chatId,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

    useEffect(() => {
      pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

      const messageHandler = (message: Message) => {
        setMessages((prev) => [message, ...prev]);
      };

      pusherClient.bind("incoming_message", messageHandler);
      console.log('pusher is working now in the client side')
      return () => {
        pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
        pusherClient.unbind("incoming_message", messageHandler);
      };
    }, [chatId]);


  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, "HH:mm a");
  };

  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse overflow-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      <div ref={scrollDownRef} />

      {messages.map((msg, index) => {
        const isCurrentUser = msg.senderId === sessionId;

        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;

        return (
          <div className="chat-message pb-1 " key={`${msg.id}-${msg.timestamp}`}>
            <div
              className={cn("flex items-end", {
                "justify-end ": isCurrentUser,
              })}
            >
              <div
                className={cn(
                  "flex flex-col text-base max-w-xs mx-2",
                  {
                    "order-1 items-end ": isCurrentUser,
                    "order-2 items-start": !isCurrentUser,
                  }
                )}
              >
                <span
                  className={cn("px-4 py-2 rounded-lg inline-block", {
                    "bg-indigo-600 text-white": isCurrentUser,
                    "bg-gray-200 text-gray-900": !isCurrentUser,
                    "rounded-br-none":
                      !hasNextMessageFromSameUser && isCurrentUser,
                    "rounded-bl-none":
                      !hasNextMessageFromSameUser && !isCurrentUser,
                  })}
                >
                  {msg.text}{" "}
                  <span className="ml-2 text-xs text-gray-400">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </span>
              </div>
              <div
                className={cn("relative w-6 h-6", {
                  "order-2": isCurrentUser,
                  "order-1": !isCurrentUser,
                  invisible: hasNextMessageFromSameUser,
                })}
              >
                <Image
                  fill
                  src={
                    isCurrentUser
                      ? (sessionImg as String).toString()
                      : chatPartner.image.toString()
                  }
                  alt="Profile picture"
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
