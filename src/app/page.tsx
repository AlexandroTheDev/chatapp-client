"use client";

import SignIn from "@/components/SignIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import socket from "@/lib/socket";
import { FormEvent, useEffect, useRef, useState } from "react";

interface IUser {
  id: string | undefined;
  name: string;
}

export default function Home() {
  const [user, setUser] = useState<null | IUser>(null);
  const [messages, setMessages] = useState<
    {
      user: IUser;
      message: string;
    }[]
  >([]);
  const [input, setInput] = useState("");

  const [typingLogs, setTypingLogs] = useState<IUser[]>([]);
  const [lastTyping, setLastTyping] = useState<number | null>(null);

  const scroller = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    socket.on("receive_message", (room, msg) => {
      if (room === "general") {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("system_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", (room, user) => {
      console.log(user);
      if (room === "general") {
        console.log(typingLogs);
        let prevCopy: IUser[] = [];
        setTypingLogs((prev) => {
          console.log("PREVP", prev);
          if (prev.some((typingUser) => typingUser.id === user.id)) {
            return prev;
          }
          prevCopy = prev;
          return [...prev, user];
        });
        setTimeout(() => {
          setTypingLogs(prevCopy);
        }, 3000);
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("system_message");
      socket.off("typing");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!scroller.current) return;
    scroller.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (user) {
      const msg = {
        user,
        message: input,
      };
      socket.emit("send_message", "general", msg);
      setMessages((prev) => [...prev, msg]);
      setInput("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    const canEmit = !lastTyping
      ? true
      : Date.now() - lastTyping >= 3000
      ? true
      : false;
    if (canEmit) {
      socket.emit("typing", "general", user);
      setLastTyping(Date.now());
    }
  };

  return (
    <div>
      {!user ? (
        <SignIn setUser={setUser} />
      ) : (
        <div className="container mx-auto">
          <div
            className="h-[100dvh] flex flex-col gap-2 px-4 bg-gray-100"
            id="wrapper"
          >
            <div id="header" className=" mt-5">
              <h1 className="text-2xl font-bold">Chatroom</h1>
            </div>
            <div className="rounded border flex-auto p-2 min-h-8 overflow-y-auto bg-white">
              {messages.map((msg, i) =>
                msg.user.name !== "system" ? (
                  user.id !== msg.user.id ? (
                    <div key={i} className="flex justify-start mb-4 text-sm">
                      <div className="max-w-[80%]">
                        <div className="text-left">{msg.user.name}</div>
                        <div className="rounded-lg border p-2 max-w-full text-wrap break-words bg-gray-300">
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex justify-end mb-4 text-sm">
                      {/* own chat */}
                      <div className="max-w-[80%]">
                        <div className="text-right">{msg.user.name}</div>
                        <div className="rounded-lg border p-2 max-w-full text-wrap break-words bg-blue-300">
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div key={i} className="text-center italic text-sm">
                    {msg.message}
                  </div>
                )
              )}
              {typingLogs.map((log: IUser, i) => (
                // <div key={i}>{log.name}is typing...</div>
                <div key={i} className="flex justify-start mb-4 text-sm">
                  <div className="rounded-lg border p-2 max-w-full text-wrap break-words bg-gray-300">
                    <div className="flex">
                      <div className="mr-1">{log.name} is typing </div>
                      <div className="relative animate-bounce">.</div>
                      <div className="relative animate-bounce delay-75">.</div>
                      <div className="relative animate-bounce delay-100">.</div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={scroller} />
            </div>

            <div id="footer" className=" mb-5">
              <form onSubmit={handleSubmit} className="flex gap-2 my-1">
                <Input
                  type="text"
                  onChange={handleChange}
                  value={input}
                  className="bg-white"
                />
                <Button type="submit" disabled={input.length < 1}>
                  Send
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
