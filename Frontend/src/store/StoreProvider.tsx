"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./index";
import { cleanupForToday } from "./classOffSlice";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Ensure we drop yesterday's OFF markers once per app load
    try {
      store.dispatch(cleanupForToday());
    } catch {}
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
