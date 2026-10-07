/**
 * Contexte Audio Preview Singleton pour la Banque Globale de Ressources d'O Girador.
 * Pilote une instance unique HTML5 Audio pour garantir zéro latence et éviter la cacophonie.
 */

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';

const AudioPreviewContext = createContext(null);

export function AudioPreviewProvider({ children }) {
  // Référence singleton vers l'instance native HTML5 Audio
  const audioRef = useRef(null);
  if (!audioRef.current && typeof Audio !== 'undefined') {
    audioRef.current = new Audio();
  }

  // États réactifs exposés au contexte
  const [currentId, setCurrentId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(null);

  // Configuration des écouteurs d'événements audio et nettoyage
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
      audio.currentTime = 0;
    };

    const handleError = (e) => {
      console.warn('[AudioPreview] Échec de lecture du flux audio :', e);
      setIsPlaying(false);
      setAudioError('Fichier audio introuvable ou indisponible');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Contrôle exclusif de lecture / pause
  const togglePlay = useCallback(async (resource) => {
    const audio = audioRef.current;
    if (!audio || !resource) return;

    const resourceId = resource.id;

    // Même ressource en cours de lecture : mise en pause
    if (resourceId === currentId && isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    // Même ressource déjà chargée et en pause : reprise de la lecture
    if (resourceId === currentId && !isPlaying) {
      try {
        setAudioError(null);
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('[AudioPreview] Erreur reprise lecture :', err);
        setAudioError('Impossible de reprendre la lecture.');
        setIsPlaying(false);
      }
      return;
    }

    // Changement de ressource : interruption et réinitialisation
    audio.pause();
    audio.currentTime = 0;
    setAudioProgress(0);

    const url = resource.audioUrl || resource.bounceUrl;
    if (!url) {
      setCurrentId(resourceId);
      setIsPlaying(false);
      setAudioError('Pré-écoute non disponible pour cet élément');
      return;
    }

    setAudioError(null);
    setCurrentId(resourceId);
    audio.src = url;

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn('[AudioPreview] Erreur lecture nouvelle ressource :', err);
      setAudioError('Fichier audio introuvable ou indisponible');
      setIsPlaying(false);
    }
  }, [currentId, isPlaying]);

  // Interruption complète et réinitialisation de la pré-écoute
  const stopPreview = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentId(null);
    setAudioProgress(0);
    setAudioError(null);
  }, []);

  // Déplacement dans la piste (0 à 100 %)
  const seek = useCallback((percent) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration || isNaN(audio.duration)) return;
    const target = (Math.max(0, Math.min(100, percent)) / 100) * audio.duration;
    audio.currentTime = target;
    setAudioProgress(percent);
  }, []);

  const value = useMemo(() => ({
    currentId,
    isPlaying,
    audioProgress,
    duration,
    audioError,
    togglePlay,
    stopPreview,
    seek
  }), [currentId, isPlaying, audioProgress, duration, audioError, togglePlay, stopPreview, seek]);

  return (
    <AudioPreviewContext.Provider value={value}>
      {children}
    </AudioPreviewContext.Provider>
  );
}

// Hook d'accès rapide avec garde-fou de présence du Provider
export function useAudioPreview() {
  const context = useContext(AudioPreviewContext);
  if (!context) {
    throw new Error('useAudioPreview doit être utilisé au sein d\'un AudioPreviewProvider');
  }
  return context;
}

export default AudioPreviewContext;
