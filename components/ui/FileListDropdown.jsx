'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiChevronDown } from 'react-icons/fi'

/**
 * Collapses several downloadable files (an order item can carry more than
 * one attachment/result, up to its qty) into one pill — a plain link when
 * there's just one file, a "Label (N)" dropdown when there are several, so
 * the row doesn't grow a button per file.
 */
export default function FileListDropdown({ label, singleLabel, icon: Icon, files, getUrl, className }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  if (!files || files.length === 0) return null

  if (files.length === 1) {
    return (
      <a className={className} href={getUrl(files[0])} target="_blank" rel="noopener" title={files[0].original_name}>
        <Icon /> {singleLabel}
      </a>
    )
  }

  return (
    <div className="file-dropdown" ref={rootRef}>
      <button
        type="button"
        className={`${className} file-dropdown__trigger`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <Icon /> {label} ({files.length})
        <FiChevronDown className="file-dropdown__chevron" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="file-dropdown__panel"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
          >
            {files.map((file, idx) => (
              <a
                key={file.id}
                href={getUrl(file)}
                target="_blank"
                rel="noopener"
                className="file-dropdown__item"
                title={file.original_name}
                onClick={() => setOpen(false)}
              >
                {label} {idx + 1} — {file.original_name}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
