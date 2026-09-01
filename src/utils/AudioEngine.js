// Audio Engine - Completely muted / Silent per user request
class AudioEngine {
  constructor() {
    this.isMuted = true;
  }

  // All sound triggers are silenced no-ops
  playKeyTick() {}
  playClickChime() {}
  playPing() {}
  playWarp() {}
  playSuccessFanfare() {}
  playCharacterHop() {}
  playSingingBowl() {}
  playAmbientChirp() {}
  
  toggleMute() {
    return true;
  }

  subscribe(callback) {
    callback(true);
    return () => {};
  }
}

export const audioEngine = new AudioEngine();
