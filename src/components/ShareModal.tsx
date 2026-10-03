import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ServerConfig } from '../types';
import { 
  X, 
  Share2, 
  QrCode, 
  Copy, 
  Check, 
  Smartphone, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ServerConfig;
  onCopy: (text: string, label: string) => void;
  copiedLabel: string | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  config,
  onCopy,
  copiedLabel
}) => {
  if (!isOpen) return null;

  const shareText = `Join my Minecraft SMP!\nJava IP: ${config.javaIp}:${config.javaPort}\nDiscord: ${config.discordInviteUrl}`;

  // Generate SVG QR code representation cleanly without external library
  // We can use a clean data URL or SVG rendering for the QR code representation
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}&color=10-185-129&bgcolor=15-23-42`;

  return (
    <AnimatePresence>
      <div 
        id="share-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          id="share-modal-dialog"
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="liquid-glass w-full max-w-md rounded-3xl p-6 sm:p-8 text-zinc-100 relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-100">
                  Share Server & Join
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Scan on mobile or copy invite
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* QR Code and Quick Share */}
          <div className="py-6 flex flex-col items-center space-y-4">
            <div className="p-3 bg-zinc-900/90 rounded-2xl border border-emerald-500/30 shadow-xl relative group">
              <img
                src={qrApiUrl}
                alt="Server QR Code"
                className="w-44 h-44 rounded-xl object-contain"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-emerald-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>

            <p className="text-xs text-zinc-400 text-center max-w-xs">
              Point your smartphone camera at the QR code to open the server connection portal instantly.
            </p>

            {/* Copy Server Invite details */}
            <button
              onClick={() => {
                sounds.playClick();
                onCopy(shareText, 'share-invite');
              }}
              className="w-full py-2.5 px-4 rounded-xl liquid-glass-pill text-zinc-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-emerald-500/40"
            >
              {copiedLabel === 'share-invite' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Invite Text Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-zinc-400" />
                  <span>Copy Full Server Invite Details</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
