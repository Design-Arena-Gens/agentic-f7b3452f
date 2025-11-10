"use client";

import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export default function NoContextMenu({ children }: Props) {
  useEffect(() => {
    const disableContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };
    document.addEventListener("contextmenu", disableContextMenu);
    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
    };
  }, []);

  return <>{children}</>;
}
