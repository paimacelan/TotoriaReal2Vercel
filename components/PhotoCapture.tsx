import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';

interface PhotoCaptureProps {
    photo?: string;
    onChange: (dataUrl: string) => void;
    shape?: 'circle' | 'rect';
}

/**
 * Componente reutilizável de captura de foto.
 * - Mobile: botão Câmera usa <input capture="environment"> → abre câmera nativa
 * - Desktop: botão Câmera abre modal com stream getUserMedia() + botão Capturar
 * - Botão Arquivo: seletor de arquivo padrão (todos os dispositivos)
 */
export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
    photo,
    onChange,
    shape = 'rect',
}) => {
    const [webcamOpen, setWebcamOpen] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [webcamError, setWebcamError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Detecta se é mobile (sem suporte a getUserMedia de forma confiável ou touch device)
    const isMobile =
        typeof window !== 'undefined' &&
        ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    /* ── Leitura de arquivo ────────────────────────────────────────────────── */
    const readFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) onChange(ev.target.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) readFile(e.target.files[0]);
        e.target.value = ''; // reset para permitir re-selecionar o mesmo arquivo
    };

    /* ── Webcam (desktop) ──────────────────────────────────────────────────── */
    const openWebcam = useCallback(async () => {
        setWebcamError('');
        setWebcamOpen(true);
        try {
            const ms = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
            });
            setStream(ms);
            // Aguarda o modal renderizar antes de atribuir o stream
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = ms;
                    videoRef.current.play();
                }
            }, 100);
        } catch {
            setWebcamError('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
        }
    }, []);

    const closeWebcam = useCallback(() => {
        stream?.getTracks().forEach((t) => t.stop());
        setStream(null);
        setWebcamOpen(false);
        setWebcamError('');
    }, [stream]);

    const captureSnapshot = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 320;
        canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
        onChange(canvas.toDataURL('image/jpeg', 0.85));
        closeWebcam();
    };

    /* ── Handle do botão Câmera ────────────────────────────────────────────── */
    const handleCameraButton = () => {
        if (isMobile) {
            // Em mobile: abre câmera nativa via input com capture
            cameraInputRef.current?.click();
        } else {
            // Em desktop: abre modal de webcam
            openWebcam();
        }
    };

    /* ── Estilos ───────────────────────────────────────────────────────────── */
    const previewClass =
        shape === 'circle'
            ? 'w-24 h-24 rounded-full'
            : 'w-28 h-28 rounded-xl';

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Preview */}
            <div
                className={`${previewClass} overflow-hidden border-2 border-gold-500/30 bg-gray-100 dark:bg-black flex items-center justify-center relative group`}
            >
                {photo ? (
                    <img src={photo} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                    <Camera className="text-gray-400" size={28} />
                )}
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2">
                {/* Arquivo */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 text-xs font-medium border border-gray-200 dark:border-white/10 transition-colors"
                >
                    <Upload size={13} /> Arquivo
                </button>

                {/* Câmera */}
                <button
                    type="button"
                    onClick={handleCameraButton}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/15 hover:bg-gold-500/25 text-gold-600 dark:text-gold-400 text-xs font-medium border border-gold-500/30 transition-colors"
                >
                    <Camera size={13} /> Câmera
                </button>
            </div>

            {/* Input oculto: seletor de arquivo */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
            />

            {/* Input oculto: câmera nativa mobile (capture="environment") */}
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileInput}
            />

            {/* Canvas oculto para snapshot da webcam */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Modal webcam (desktop) */}
            {webcamOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
                    <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden w-full max-w-sm shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                            <span className="font-semibold text-white text-sm flex items-center gap-2">
                                <Camera size={16} className="text-gold-400" /> Câmera ao vivo
                            </span>
                            <button
                                type="button"
                                onClick={closeWebcam}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Video */}
                        <div className="bg-black aspect-square w-full relative flex items-center justify-center">
                            {webcamError ? (
                                <p className="text-red-400 text-sm text-center px-4">{webcamError}</p>
                            ) : (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 p-4">
                            <button
                                type="button"
                                onClick={closeWebcam}
                                className="flex-1 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <X size={15} /> Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={captureSnapshot}
                                disabled={!!webcamError}
                                className="flex-1 py-2.5 rounded-lg bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-black text-sm font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <Check size={15} /> Capturar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
