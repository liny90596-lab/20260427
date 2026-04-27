
// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let isVideoReady = false;

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Added a callback function to verify the stream is ready
  video = createCapture(VIDEO, { flipped: true }, function(stream) {
    console.log("攝影機已就緒！");
    isVideoReady = true;
    handPose.detectStart(video, gotHands);
  });
  
  video.hide();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background('#e7c6ff');

  // 如果攝影機尚未就緒，顯示提示文字
  if (!isVideoReady) {
    fill(100);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("正在尋找或啟動攝影機...", width / 2, height / 2);
    return;
  }

  // 計算顯示影像的尺寸 (全螢幕的 50%)
  let displayW = width * 0.5;
  let displayH = height * 0.5;
  
  // 計算置中座標
  let x = (width - displayW) / 2;
  let y = (height - displayH) / 2;

  // 繪製置中且縮放後的影像
  image(video, x, y, displayW, displayH);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // Loop through keypoints and draw circles
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          // 將原始影像座標對應到畫布上的縮放座標
          let mappedX = map(keypoint.x, 0, video.width, x, x + displayW);
          let mappedY = map(keypoint.y, 0, video.height, y, y + displayH);

          noStroke();
          circle(mappedX, mappedY, 16);
        }
      }
    }
  }
}
