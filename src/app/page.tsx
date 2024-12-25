"use client";

import SignIn from "@/components/SignIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import socket from "@/lib/socket";
import { FormEvent, useEffect, useRef, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<null | string>(null);
  const [messages, setMessages] = useState<{ user: string; message: string }[]>(
    []
  );
  const [input, setInput] = useState("");

  const scroller = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    socket.on("receive_message", (msg) => {
      console.log(msg, "TESTESR");
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("system_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receive_message");
      socket.off("system_message");
    };
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
      socket.emit("send_message", msg);
      setMessages((prev) => [...prev, msg]);
      setInput("");
    }
  };

  return (
    <div>
      {!user ? (
        <SignIn setUser={setUser} />
      ) : (
        <div className="container mx-auto">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-8">
              <div className="flex flex-col h-screen">
                <div className="rounded border min-h-4 p-2 flex-1 overflow-auto">
                  {messages.map((msg, i) => (
                    <div key={i}>{msg.message}</div>
                  ))}
                  <div ref={scroller} />
                </div>
                <div className="">
                  <form onSubmit={handleSubmit} className="flex gap-2 my-1">
                    <Input
                      type="text"
                      onChange={(e) => setInput(e.target.value)}
                      value={input}
                    />
                    <Button type="submit" disabled={input.length < 1}>
                      Send
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
