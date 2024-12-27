"use client";

import React, { FormEvent, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import socket from "@/lib/socket";

export default function SignIn({
  setUser,
}: {
  setUser: React.Dispatch<
    React.SetStateAction<null | { id: string | undefined; name: string }>
  >;
}) {
  const [open, setOpen] = useState<boolean>(true);
  const [name, setName] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    socket.emit("new_user", "general", {
      id: socket.id,
      name,
    });
    setUser({ id: socket.id, name });
  };

  return (
    <div className=" h-screen  w-screen ">
      <div className="flex justify-center items-center h-screen">
        <div>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button>Sign In</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <form onSubmit={handleSubmit}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hello, Welcome!</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tell us your name to start conversation.
                    <Input
                      className="my-1"
                      onChange={(e) => setName(e.target.value)}
                    />
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  {/* <AlertDialogCancel>Cancel</AlertDialogCancel> */}
                  <AlertDialogAction type="submit" disabled={name.length < 3}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
