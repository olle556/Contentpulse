"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckIcon } from "@radix-ui/react-icons"
import { createPortal } from 'react-dom'

interface AutosaveToastProps {
  show: boolean;
}

export default function AutosaveToast({ show }: AutosaveToastProps) {
  if (typeof window === 'undefined') return null

  return createPortal(
    <div className="fixed bottom-0 right-0 p-6 z-[9999]">
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 50, x: 50 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 text-sm text-zinc-200 shadow-lg"
          >
            <CheckIcon className="h-4 w-4 text-green-400" />
            <span>Changes saved</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  )
}
