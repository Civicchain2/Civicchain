"use client"

import { useEffect, useRef } from "react"

interface QRCodeGeneratorProps {
  value: string
  size?: number
  level?: "L" | "M" | "Q" | "H"
  includeMargin?: boolean
}

export function QRCodeGenerator({ value, size = 256, level = "M", includeMargin = true }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

   useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Dynamic import of qr code library
    import("qrcode")
      .then((QRCode) => {
        QRCode.toCanvas(
          canvas,
          value,
          {
            errorCorrectionLevel: level,
            margin: includeMargin ? 2 : 0,
            width: size,
            color: {
              dark: "#ffffff",
              light: "#4c1d95", // dark purple background
            },
          },
          (error: any) => {
            if (error) console.error("QR Code generation error:", error)
          },
        )
      })
      .catch(() => {
        // Show error message in canvas
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.fillStyle = "#4c1d95"
          ctx.fillRect(0, 0, size, size)
          ctx.fillStyle = "#ffffff"
          ctx.font = "12px Arial"
          ctx.textAlign = "center"
          ctx.fillText("QR Code", size / 2, size / 2)
        }
      })
  }, [value, size, level, includeMargin])

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="border border-border/40 rounded-lg p-2 bg-background"
      />
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Share this QR code to provide payment verification details
      </p>
    </div>
  )
}
