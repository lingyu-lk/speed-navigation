// ==================== Pixel Bunny Follower ====================
// 像素风格小兔子跟随鼠标效果
// 功能：鼠标移动时兔子追随，鼠标静止时兔子坐下休息

class PixelBunny {
    constructor() {
        // 配置参数
        this.config = {
            speed: 0.08,              // 移动速度（0-1，值越大越快）
            rotationSpeed: 0.15,      // 旋转速度
            stopDelay: 800,           // 鼠标静止多久后兔子坐下（毫秒）
            boundary: 20,             // 距离边界的安全距离（像素）
            arrivalThreshold: 5       // 到达目标点的阈值（像素）
        };

        // 状态变量
        this.bunny = null;
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.bunnyX = window.innerWidth / 2;
        this.bunnyY = window.innerHeight / 2;
        this.targetRotation = 0;
        this.currentRotation = 0;
        this.isMoving = false;
        this.stopTimer = null;
        this.animationFrame = null;

        this.init();
    }

    init() {
        this.createBunny();
        this.setupEventListeners();
        this.startAnimation();
    }

    createBunny() {
        // 创建兔子元素
        this.bunny = document.createElement('div');
        this.bunny.className = 'pixel-bunny';
        this.bunny.innerHTML = `
            <div class="bunny-body">
                <div class="bunny-sprite running"></div>
            </div>
        `;
        document.body.appendChild(this.bunny);

        // 初始位置
        this.updateBunnyPosition();
    }

    setupEventListeners() {
        // 监听鼠标移动
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.onMouseMove();
        });

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.checkBoundaries();
        });
    }

    onMouseMove() {
        // 清除之前的停止计时器
        if (this.stopTimer) {
            clearTimeout(this.stopTimer);
        }

        // 设置为移动状态
        if (!this.isMoving) {
            this.isMoving = true;
            this.bunny.classList.add('moving');
            this.bunny.classList.remove('sitting');
        }

        // 设置新的停止计时器
        this.stopTimer = setTimeout(() => {
            this.stopMoving();
        }, this.config.stopDelay);
    }

    stopMoving() {
        this.isMoving = false;
        this.bunny.classList.remove('moving');
        this.bunny.classList.add('sitting');
    }

    startAnimation() {
        const animate = () => {
            if (this.isMoving) {
                this.updatePosition();
            }
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }

    updatePosition() {
        // 计算兔子到鼠标的距离和角度
        const dx = this.mouseX - this.bunnyX;
        const dy = this.mouseY - this.bunnyY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 如果距离足够近，停止移动
        if (distance < this.config.arrivalThreshold) {
            return;
        }

        // 计算目标角度（弧度转角度）
        this.targetRotation = Math.atan2(dy, dx) * (180 / Math.PI);

        // 平滑旋转
        let rotationDiff = this.targetRotation - this.currentRotation;

        // 处理角度环绕问题（-180到180）
        if (rotationDiff > 180) rotationDiff -= 360;
        if (rotationDiff < -180) rotationDiff += 360;

        this.currentRotation += rotationDiff * this.config.rotationSpeed;

        // 根据角度和速度移动兔子
        const moveDistance = Math.min(distance, distance * this.config.speed);
        this.bunnyX += (dx / distance) * moveDistance;
        this.bunnyY += (dy / distance) * moveDistance;

        // 边界检测
        this.checkBoundaries();

        // 更新兔子位置
        this.updateBunnyPosition();
    }

    checkBoundaries() {
        const boundary = this.config.boundary;
        const maxX = window.innerWidth - boundary;
        const maxY = window.innerHeight - boundary;

        // 限制在边界内
        this.bunnyX = Math.max(boundary, Math.min(maxX, this.bunnyX));
        this.bunnyY = Math.max(boundary, Math.min(maxY, this.bunnyY));
    }

    updateBunnyPosition() {
        if (!this.bunny) return;

        // 更新位置和旋转
        this.bunny.style.transform = `
            translate(${this.bunnyX}px, ${this.bunnyY}px)
            rotate(${this.currentRotation}deg)
        `;
    }

    // 销毁方法（如果需要移除兔子）
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.stopTimer) {
            clearTimeout(this.stopTimer);
        }
        if (this.bunny) {
            this.bunny.remove();
        }
    }
}

// 初始化兔子
let pixelBunny = null;

// 页面加载完成后创建兔子
window.addEventListener('DOMContentLoaded', () => {
    // 延迟创建，避免影响页面加载
    setTimeout(() => {
        pixelBunny = new PixelBunny();
        console.log('🐰 像素兔子已启动！');
    }, 1000);
});

// 导出到全局（方便调试）
window.PixelBunny = PixelBunny;
window.pixelBunny = pixelBunny;
