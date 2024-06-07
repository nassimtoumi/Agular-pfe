import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-sound-wave',
  templateUrl: './sound-wave.component.html',
  styleUrls: ['./sound-wave.component.css']
})
export class SoundWaveComponent implements OnInit, OnDestroy {
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private dataArray?: Uint8Array;
  private animationFrameId?: number;
  private heights: number[];
  private readonly barWidth = 7 ;
  private readonly spaceBetweenBars = 7 ;

  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;
  private canvasCtx?: CanvasRenderingContext2D;

  constructor() {
    this.heights = [];
  }

  ngOnInit(): void {
    this.setupAudioContext();
  }

  setupAudioContext() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.audioContext = new AudioContext();
        const source = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        source.connect(this.analyser);
        this.analyser.fftSize = 2048;
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
        this.heights = new Array(bufferLength).fill(0); // Initialize heights
        this.canvasCtx = this.canvas.nativeElement.getContext('2d');
        this.animate();
      })
      .catch(error => console.error('Error accessing the microphone', error));
  }

  animate() {
    setTimeout(() => {
      this.animationFrameId = requestAnimationFrame(() => this.animate());
    }, 1000 / 30); // Smoother transition
  
    this.analyser.getByteTimeDomainData(this.dataArray);
    const canvas = this.canvas.nativeElement;
    const canvasCtx = this.canvasCtx;
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  
    let x = 0; // Initial x position for the first bar
    let maxVolume = 0; // Track the maximum volume in the current frame
  
    // Calculate the maximum volume for dynamic height scaling
    for (let i = 0; i < this.dataArray.length; i++) {
      const value = this.dataArray[i];
      maxVolume = Math.max(maxVolume, Math.abs(value - 128));
    }
  
    const middleIndex = this.dataArray.length / 2;
  
    for (let i = 0; i < this.dataArray.length; i++) {
      const value = this.dataArray[i];
      const normalizedValue = (value - 128) / 128; // Normalize between -1 and 1
      const dynamicRangeAdjustment = (canvas.height / 2) * (Math.abs(normalizedValue) / (maxVolume / 128));
      const barHeight = dynamicRangeAdjustment > 0 ? dynamicRangeAdjustment : 0; // Ensure minimum height
      const middleScaleFactor = 1 + 2 * Math.cos((i - middleIndex) / middleIndex * Math.PI); // Increase scale in the middle
      const scaledHeight = barHeight * middleScaleFactor;
      const distanceFromMiddle = Math.abs(i - middleIndex);
      const opacity = 0.3 + 1 * (1 - distanceFromMiddle / middleIndex); // Higher opacity in the middle
  
      // Set the style for the bars
      canvasCtx.fillStyle = `rgba(255, 255, 255, ${opacity.toFixed(100)})`;
  
      // Draw each bar
      canvasCtx.fillRect(x, canvas.height / 2 - scaledHeight / 2, this.barWidth, scaledHeight);
  
      // Move to the next bar position
      x += this.barWidth + this.spaceBetweenBars;
    }
  }
  
  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrameId);
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
