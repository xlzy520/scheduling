export default function playAnimate(canvas, option, fn) {
  let ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  let divide = option.divide || 2;
  // let w = canvas.width = document.body.offsetWidth;
  // let h = canvas.height = document.body.offsetHeight;
  // canvas.height = '100%';
  // canvas.width = '100%';
  // let w = document.body.offsetWidth;
  // let h = document.body.offsetHeight;
  let hue = option.hue || 217;
  let stars = option.stars || [];
  let count = 0;
  let maxStars = option.maxStars || 1300; //星星数量
  let stop = {id: null}; //stop必须是引用类型值，用来停止动画

  let canvas2 = document.createElement('canvas');
  let ctx2 = canvas2.getContext('2d');
  canvas2.width = 100;
  canvas2.height = 100;
  let half = canvas2.width / 2;
  let gradient2 = ctx2.createRadialGradient(half, half, 0, half, half, half);
  gradient2.addColorStop(0.025, '#CCC');
  gradient2.addColorStop(0.1, 'hsl(' + hue + ', 61%, 33%)');
  gradient2.addColorStop(0.25, 'hsl(' + hue + ', 64%, 6%)');
  gradient2.addColorStop(1, 'transparent');

  ctx2.fillStyle = gradient2;
  ctx2.beginPath();
  ctx2.arc(half, half, half, 0, Math.PI * 2);
  ctx2.fill();

  // End cache

  let Star = function() {

    this.orbitRadius = random(maxOrbit(w, h));
    this.radius = random(60, this.orbitRadius) / 8;
    //星星大小
    this.orbitX = w / 2;
    this.orbitY = h / 2;
    this.timePassed = random(0, maxStars);
    this.speed = random(this.orbitRadius) / 50000;
    //星星移动速度
    this.alpha = random(2, 10) / 10;

    // count++;
    // stars[count] = this;
    return this;
  };

  Star.prototype.draw = function() {
    let x = Math.sin(this.timePassed) * this.orbitRadius + this.orbitX;
    let y = Math.cos(this.timePassed) * this.orbitRadius + this.orbitY;
    let twinkle = random(10);

    if (twinkle === 1 && this.alpha > 0) {
      this.alpha -= 0.05;
    } else if (twinkle === 2 && this.alpha < 1) {
      this.alpha += 0.05;
    }

    ctx.globalAlpha = this.alpha;
    ctx.drawImage(canvas2, x - this.radius / 2, y - this.radius / 2, this.radius, this.radius);
    this.timePassed += this.speed;
  };
  for (let i = 0; i < maxStars; i++) {
    stars[i] = new Star();
  }

  function animation() {
    if (count % divide === 0) {
      ctx.beginPath();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.5; //尾巴
      ctx.fillStyle = 'hsla(' + hue + ', 64%, 6%, 2)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      if (document.body.offsetWidth !== w || document.body.offsetHeight !== h) {//可视区域变化时
        w = canvas.width = document.body.offsetWidth;
        h = canvas.height = document.body.offsetHeight;
        // count = 0;
        stars = [];
        for (let i = 0; i < maxStars; i++) {
          stars[i] = new Star();
        }
      }
      for (let i = 1, l = stars.length; i < l; i++) {
        stars[i].draw();
      }
    }
    stop.id = window.requestAnimationFrame(animation);
  }
  stop.id = window.requestAnimationFrame(animation);
  // animation();
  fn.constructor === Function && fn({
    hue: hue,
    stars: stars,
    // count: count,
    maxStars: maxStars, //星星数量
    stop: stop
  });
}

function random(min, max) {
  if (arguments.length < 2) {
    max = min;
    min = 0;
  }

  if (min > max) {
    let hold = max;
    max = min;
    min = hold;
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function maxOrbit(x, y) {
  let max = Math.max(x, y);
  let diameter = Math.round(Math.sqrt(max * max + max * max));
  return diameter / 2;
  //星星移动范围，值越大范围越小，
}
