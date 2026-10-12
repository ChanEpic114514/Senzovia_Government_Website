# Theme gallery update — 12 October 2026

The homepage's “Explore six themes” control now opens a full-viewport sequence using the six final illustrations. Layers move upward in rapid succession, with display-time framing to bring the subjects into closer visual alignment.

Each layer enters over 650 ms, with successive layers starting 110 ms apart. The homepage is revealed as a seventh layer, completing the animation in approximately 1.31 seconds after playback starts. The final illustration has no additional hold. Only the localized Skip control appears over the sequence; Escape also exits, and normal page interaction resumes automatically.

All six images are loaded and decoded before playback. Reduced-motion preferences receive a brief static view. The artwork files are preserved; subject framing is applied only during display. The implementation uses the native Web Animations API, with an independently written layered transition inspired by Codrops LayersAnimation: https://github.com/codrops/LayersAnimation.

The animation was already present in the repository when this note was added. This documentation update does not modify animation code, timing, or artwork.
