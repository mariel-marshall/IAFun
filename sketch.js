let capture;
let glitchBuffer;
let noiseAmount = 0.4;
let rgbShiftAmount = 150;
let saturationBoost = 5.0;
let posterizeLevel = 3;
let glitchIntensity = 0.6;
let blockSize = 20;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Start webcam capture
  capture = createCapture(VIDEO);
  capture.size(windowWidth, windowHeight);
  capture.hide();
  
  // Create buffer for glitch effects
  glitchBuffer = createGraphics(windowWidth, windowHeight);
  colorMode(HSB, 100);
}

function draw() {
  // Draw camera feed to buffer
  glitchBuffer.image(capture, 0, 0, width, height);
  
  // Apply enhanced effects
  applyColorBoost();
  applyRGBShift();
  applyNoise();
  applyPixelSort();
  applyPosterize();
  
  // Display final result
  image(glitchBuffer, 0, 0);
}

function applyColorBoost() {
  glitchBuffer.loadPixels();
  let d = glitchBuffer.pixelDensity();
  
  for (let i = 0; i < glitchBuffer.pixels.length; i += 4) {
    let r = glitchBuffer.pixels[i];
    let g = glitchBuffer.pixels[i + 1];
    let b = glitchBuffer.pixels[i + 2];
    
    // Convert to HSB
    let hsb = RGBtoHSB(r, g, b);
    hsb.s *= saturationBoost;
    hsb.s = constrain(hsb.s, 0, 100);
    
    // Convert back to RGB
    let rgb = HSBtoRGB(hsb.h, hsb.s, hsb.b);
    glitchBuffer.pixels[i] = rgb.r;
    glitchBuffer.pixels[i + 1] = rgb.g;
    glitchBuffer.pixels[i + 2] = rgb.b;
  }
  glitchBuffer.updatePixels();
}

function applyRGBShift() {
  glitchBuffer.loadPixels();
  let d = glitchBuffer.pixelDensity();
  
  // Even more extreme RGB shift with chaotic movement
  let shiftX = rgbShiftAmount * (noise(frameCount * 0.05) + sin(frameCount * 0.2));
  let shiftY = rgbShiftAmount * (noise(frameCount * 0.05 + 1000) + cos(frameCount * 0.2));
  
  // More frequent glitch bands
  for (let i = 0; i < 5; i++) { // Multiple glitch lines
    if (random() < glitchIntensity) {
      let glitchPos = floor(random(height));
      let glitchHeight = random(20, 100);
      
      for (let y = glitchPos; y < min(glitchPos + glitchHeight, height); y++) {
        let rowShift = random(-width/2, width/2);
        
        for (let x = 0; x < width; x++) {
          let idx = 4 * (y * width * d + x);
          let targetX = (x + rowShift + width) % width;
          let targetIdx = 4 * (y * width * d + floor(targetX));
          
          // Extreme channel separation
          glitchBuffer.pixels[idx] = glitchBuffer.pixels[targetIdx + floor(random(-2, 2)) * 4];
          glitchBuffer.pixels[idx + 1] = glitchBuffer.pixels[targetIdx + 1];
          glitchBuffer.pixels[idx + 2] = glitchBuffer.pixels[targetIdx + 2 + floor(random(-2, 2)) * 4];
        }
      }
    }
  }
  glitchBuffer.updatePixels();
}

function applyNoise() {
  glitchBuffer.loadPixels();
  
  // More and larger glitch blocks
  for (let i = 0; i < 10; i++) {
    if (random() < glitchIntensity) {
      let blockX = floor(random(width));
      let blockY = floor(random(height));
      let blockW = random(50, 200);
      let blockH = random(10, 50);
      
      for (let y = blockY; y < min(blockY + blockH, height); y++) {
        for (let x = blockX; x < min(blockX + blockW, width); x++) {
          let idx = 4 * (y * width + x);
          let noiseColor = color(random(100), random(50, 100), random(50, 100));
          glitchBuffer.pixels[idx] = red(noiseColor);
          glitchBuffer.pixels[idx + 1] = green(noiseColor);
          glitchBuffer.pixels[idx + 2] = blue(noiseColor);
        }
      }
    }
  }
  
  // Pixelation effect
  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      if (random() < noiseAmount) {
        let idx = 4 * (y * width + x);
        let noiseColor = color(random(100), 80, 100);
        
        // Fill entire block with same color
        for (let by = 0; by < blockSize; by++) {
          for (let bx = 0; bx < blockSize; bx++) {
            if (y + by < height && x + bx < width) {
              let blockIdx = 4 * ((y + by) * width + (x + bx));
              glitchBuffer.pixels[blockIdx] = red(noiseColor);
              glitchBuffer.pixels[blockIdx + 1] = green(noiseColor);
              glitchBuffer.pixels[blockIdx + 2] = blue(noiseColor);
            }
          }
        }
      }
    }
  }
  glitchBuffer.updatePixels();
}

function applyPixelSort() {
  glitchBuffer.loadPixels();
  let d = glitchBuffer.pixelDensity();
  
  // Sort more rows and with larger segments
  if (random() < glitchIntensity) {
    for (let n = 0; n < 8; n++) {  // Increased number of sorted rows
      let y = floor(random(height));
      let sortStart = floor(random(width/2));
      let sortEnd = sortStart + random(width/2, width);
      let row = [];
      
      // Get row pixels
      for (let x = sortStart; x < sortEnd; x++) {
        let idx = 4 * (y * width * d + x);
        row.push({
          r: glitchBuffer.pixels[idx],
          g: glitchBuffer.pixels[idx + 1],
          b: glitchBuffer.pixels[idx + 2],
          a: glitchBuffer.pixels[idx + 3]
        });
      }
      
      // Sort with random criteria
      row.sort((a, b) => {
        if (random() < 0.5) {
          return (a.r + a.g + a.b) - (b.r + b.g + b.b);
        } else {
          return a.r - b.r;
        }
      });
      
      // Put sorted pixels back
      for (let i = 0; i < row.length; i++) {
        let idx = 4 * (y * width * d + (sortStart + i));
        glitchBuffer.pixels[idx] = row[i].r;
        glitchBuffer.pixels[idx + 1] = row[i].g;
        glitchBuffer.pixels[idx + 2] = row[i].b;
        glitchBuffer.pixels[idx + 3] = row[i].a;
      }
    }
  }
  
  glitchBuffer.updatePixels();
}

function applyPosterize() {
  glitchBuffer.loadPixels();
  
  for (let i = 0; i < glitchBuffer.pixels.length; i += 4) {
    // More extreme posterization
    glitchBuffer.pixels[i] = floor(glitchBuffer.pixels[i] / posterizeLevel) * posterizeLevel;
    glitchBuffer.pixels[i + 1] = floor(glitchBuffer.pixels[i + 1] / posterizeLevel) * posterizeLevel;
    glitchBuffer.pixels[i + 2] = floor(glitchBuffer.pixels[i + 2] / posterizeLevel) * posterizeLevel;
    
    // Random color inversions
    if (random() < 0.1) {
      glitchBuffer.pixels[i] = 255 - glitchBuffer.pixels[i];
      glitchBuffer.pixels[i + 1] = 255 - glitchBuffer.pixels[i + 1];
      glitchBuffer.pixels[i + 2] = 255 - glitchBuffer.pixels[i + 2];
    }
  }
  glitchBuffer.updatePixels();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  glitchBuffer = createGraphics(windowWidth, windowHeight);
}

function RGBtoHSB(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  let d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 100, s: s * 100, b: v * 100 };
}

function HSBtoRGB(h, s, v) {
  h /= 100; s /= 100; v /= 100;
  let r, g, b;
  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}
