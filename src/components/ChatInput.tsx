"use client";
import { FC, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Button from "./ui/Button";
import axios from "axios";
import toast from "react-hot-toast";
interface ChatInputProps {
  chatPartner: User;
  chatId: string;
}

const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {
  const [input, setInput] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const sendMessage = async () => {
    if (!input) return;
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await axios.post("/api/message/send", { text: input, chatId });
      setInput("");
      textareaRef.current?.focus();
    } catch (error) {
      toast.error("something went wrong. please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" flex border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
      <div className="relative mr-2  py-[0.15rem] flex-1 overflow-visible rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
        <TextareaAutosize
          ref={textareaRef}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={`Message ${chatPartner.name}`}
          className="block w-full  resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 text-sm leading-6"
        />
        <div
          onClick={() => textareaRef.current?.focus()}
          className="py-0"
          aria-hidden="true"
        >
          {/* <div className="py-px">
            <div className="h-9"></div>
          </div> */}
        </div>

      </div>        
      <div className="flex justify-between">
          <div className="flex-shrink-0">
            <Button isLoading={isLoading} onClick={sendMessage} type="submit">
              Post
            </Button>
          </div>
        </div>
    </div>
  );
};

export default ChatInput;
