
// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let isVideoReady = false;
let bubbles = []; // 儲存所有水泡的陣列

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

          // 在關鍵點 4, 8, 12, 16, 20 產生水泡
          let targetPoints = [4, 8, 12, 16, 20];
          if (targetPoints.includes(i)) {
            if (frameCount % 2 === 0) { // 控制產生頻率，避免水泡過多
              bubbles.push(new Bubble(mappedX, mappedY));
            }
          }
        }

        // 定義需要連線的關鍵點編號群組
        let segments = [
          [0, 1, 2, 3, 4],     // 0 到 4 串接
          [5, 6, 7, 8],        // 5 到 8 串接
          [9, 10, 11, 12],     // 9 到 12 串接
          [13, 14, 15, 16],    // 13 到 16 串接
          [17, 18, 19, 20]     // 17 到 20 串接
        ];

        // 根據左右手設定線條顏色（與圓點相同）
        stroke(hand.handedness == "Left" ? color(255, 0, 255) : color(255, 255, 0));
        strokeWeight(4); // 設定線條粗細

        // 畫出每一組的連線
        for (let segment of segments) {
          for (let i = 0; i < segment.length - 1; i++) {
            let kp1 = hand.keypoints[segment[i]];
            let kp2 = hand.keypoints[segment[i + 1]];

            // 同樣需要將座標對應到畫布的縮放比例與位移
            let x1 = map(kp1.x, 0, video.width, x, x + displayW);
            let y1 = map(kp1.y, 0, video.height, y, y + displayH);
            let x2 = map(kp2.x, 0, video.width, x, x + displayW);
            let y2 = map(kp2.y, 0, video.height, y, y + displayH);

            line(x1, y1, x2, y2);
          }
        }
      }
    }
  }

  // 更新並繪製所有水泡
  // 水泡會往上串升，當超過影像視窗頂部 (y) 時會「破掉」（從陣列移除）
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    // 如果水泡飄出影像視窗頂端，則移除
    if (bubbles[i].y < y) {
      bubbles.splice(i, 1);
    }
  }

  // 在影像視窗上的中間加上一串文字
  fill(0); // 設定文字顏色為黑色
  noStroke();
  textSize(32);
  textAlign(CENTER, CENTER);
  text("414730944林宥妘", width / 2, y / 2);
}

// 水泡類別
class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = random(8, 20); // 隨機大小
    this.speed = random(2, 5); // 隨機向上速度
    this.noiseOffset = random(1000); // 增加一點左右晃動的隨機感
  }

  update() {
    this.y -= this.speed; // 往上移動
    this.x += map(noise(this.noiseOffset), 0, 1, -1, 1); // 輕微左右晃動
    this.noiseOffset += 0.05;
  }

  display() {
    stroke(255, 200); // 白色半透明邊框
    strokeWeight(1);
    noFill();
    circle(this.x, this.y, this.r);
  }
}
