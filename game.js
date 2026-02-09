class CavityBugGame {
    constructor() {
        this.level = 1;
        this.score = 0;
        this.gameActive = false;
        this.foodResidues = [];
        this.cavityBugs = [];
        this.toothModel = document.getElementById('tooth-model');
        this.startButton = document.getElementById('start-button');
        this.toothpasteGun = document.getElementById('toothpaste-gun');
        this.toothbrushSword = document.getElementById('toothbrush-sword');
        this.gameMessage = document.getElementById('game-message');
        this.levelDisplay = document.getElementById('level');
        this.scoreDisplay = document.getElementById('score');
        this.popSound = document.getElementById('pop-sound');
        this.winSound = document.getElementById('win-sound');
        this.buttonSound = document.getElementById('button-sound');
        
        this.init();
    }
    
    playSound(sound) {
        try {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Sound play failed:', e));
        } catch (e) {
            console.log('Sound error:', e);
        }
    }
    
    init() {
        // 添加点击和触摸事件支持
        this.startButton.addEventListener('click', () => this.startGame());
        this.startButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startGame();
        });
        
        this.toothpasteGun.addEventListener('click', () => this.useToothpasteGun());
        this.toothpasteGun.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.useToothpasteGun();
        });
        
        this.toothbrushSword.addEventListener('click', () => this.useToothbrushSword());
        this.toothbrushSword.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.useToothbrushSword();
        });
        
        this.superCleaner = document.getElementById('super-cleaner');
        if (this.superCleaner) {
            this.superCleaner.addEventListener('click', () => this.useSuperCleaner());
            this.superCleaner.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.useSuperCleaner();
            });
        }
    }
    
    startGame() {
        this.playSound(this.buttonSound);
        this.level = 1;
        this.score = 0;
        this.gameActive = true;
        this.startButton.textContent = '重新开始';
        
        // 添加游戏开始倒计时
        this.gameMessage.textContent = '准备开始！';
        
        let countdown = 3;
        const countdownInterval = setInterval(() => {
            if (countdown > 0) {
                this.gameMessage.textContent = `准备开始！${countdown}`;
                this.playSound(this.buttonSound);
                countdown--;
            } else {
                clearInterval(countdownInterval);
                this.gameMessage.textContent = '开始清除食物残渣！';
                this.clearGameArea();
                this.generateFoodResidues();
                this.updateDisplay();
            }
        }, 1000);
    }
    
    clearGameArea() {
        this.toothModel.innerHTML = '';
        this.foodResidues = [];
        this.cavityBugs = [];
    }
    
    generateFoodResidues() {
        const residueCount = 5 + (this.level * 2);
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd93d', '#6a0572'];
        
        for (let i = 0; i < residueCount; i++) {
            const residue = document.createElement('div');
            residue.className = 'food-residue';
            residue.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            residue.style.left = `${Math.random() * (this.toothModel.offsetWidth - 25)}px`;
            residue.style.top = `${Math.random() * (this.toothModel.offsetHeight - 25)}px`;
            // 添加点击和触摸事件支持
            residue.addEventListener('click', () => this.removeFoodResidue(residue));
            residue.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.removeFoodResidue(residue);
            });
            
            // 添加移动属性
            residue.speedX = (Math.random() - 0.5) * 2;
            residue.speedY = (Math.random() - 0.5) * 2;
            
            this.toothModel.appendChild(residue);
            this.foodResidues.push(residue);
        }
        
        // 启动食物残渣移动
        this.moveFoodResidues();
    }
    
    moveFoodResidues() {
        if (!this.gameActive) return;
        
        this.foodResidues.forEach(residue => {
            if (!residue) return;
            
            let x = parseFloat(residue.style.left) || 0;
            let y = parseFloat(residue.style.top) || 0;
            
            // 更新位置
            x += residue.speedX;
            y += residue.speedY;
            
            // 边界检测和反弹
            const maxX = this.toothModel.offsetWidth - 25;
            const maxY = this.toothModel.offsetHeight - 25;
            
            if (x < 0 || x > maxX) {
                residue.speedX = -residue.speedX;
                x = Math.max(0, Math.min(maxX, x));
            }
            
            if (y < 0 || y > maxY) {
                residue.speedY = -residue.speedY;
                y = Math.max(0, Math.min(maxY, y));
            }
            
            // 随机改变速度，使移动更有趣
            if (Math.random() < 0.02) {
                residue.speedX = (Math.random() - 0.5) * 2;
                residue.speedY = (Math.random() - 0.5) * 2;
            }
            
            // 更新样式
            residue.style.left = `${x}px`;
            residue.style.top = `${y}px`;
        });
        
        // 继续移动
        requestAnimationFrame(() => this.moveFoodResidues());
    }
    
    removeFoodResidue(residue) {
        if (!this.gameActive) return;
        
        this.playSound(this.popSound);
        
        // 创建爆炸效果
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = residue.style.left;
        explosion.style.top = residue.style.top;
        this.toothModel.appendChild(explosion);
        
        // 移除残渣
        residue.remove();
        this.foodResidues = this.foodResidues.filter(r => r !== residue);
        
        // 增加分数
        this.score += 10;
        this.updateDisplay();
        
        // 检查是否清除完所有残渣
        if (this.foodResidues.length === 0) {
            this.gameMessage.textContent = '食物残渣已清除！现在准备对抗蛀牙虫！';
            setTimeout(() => this.generateCavityBugs(), 1000);
        }
    }
    
    generateCavityBugs() {
        const bugCount = this.level + 1;
        
        for (let i = 0; i < bugCount; i++) {
            const bug = document.createElement('div');
            bug.className = 'cavity-bug';
            bug.style.left = `${Math.random() * (this.toothModel.offsetWidth - 35)}px`;
            bug.style.top = `${Math.random() * (this.toothModel.offsetHeight - 35)}px`;
            // 添加点击和触摸事件支持
            bug.addEventListener('click', () => this.attackCavityBug(bug));
            bug.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.attackCavityBug(bug);
            });
            
            // 添加嘴巴元素
            const mouth = document.createElement('span');
            bug.appendChild(mouth);
            
            // 添加移动属性
            bug.speedX = (Math.random() - 0.5) * 1.5;
            bug.speedY = (Math.random() - 0.5) * 1.5;
            bug.wiggleDirection = 1;
            bug.wiggleCount = 0;
            
            this.toothModel.appendChild(bug);
            this.cavityBugs.push(bug);
        }
        
        this.gameMessage.textContent = `击败所有${bugCount}只蛀牙虫！`;
        
        // 启动蛀牙虫移动
        this.moveCavityBugs();
    }
    
    moveCavityBugs() {
        if (!this.gameActive) return;
        
        this.cavityBugs.forEach(bug => {
            if (!bug) return;
            
            let x = parseFloat(bug.style.left) || 0;
            let y = parseFloat(bug.style.top) || 0;
            
            // 更新位置
            x += bug.speedX;
            y += bug.speedY;
            
            // 边界检测和反弹
            const maxX = this.toothModel.offsetWidth - 35;
            const maxY = this.toothModel.offsetHeight - 35;
            
            if (x < 0 || x > maxX) {
                bug.speedX = -bug.speedX;
                x = Math.max(0, Math.min(maxX, x));
            }
            
            if (y < 0 || y > maxY) {
                bug.speedY = -bug.speedY;
                y = Math.max(0, Math.min(maxY, y));
            }
            
            // 随机改变速度，使移动更有趣
            if (Math.random() < 0.03) {
                bug.speedX = (Math.random() - 0.5) * 1.5;
                bug.speedY = (Math.random() - 0.5) * 1.5;
            }
            
            // 增加摆动效果
            bug.wiggleCount++;
            if (bug.wiggleCount > 20) {
                bug.wiggleDirection = -bug.wiggleDirection;
                bug.wiggleCount = 0;
            }
            
            // 应用摆动变换
            const wiggleAngle = bug.wiggleDirection * 5;
            bug.style.transform = `rotate(${wiggleAngle}deg)`;
            
            // 更新样式
            bug.style.left = `${x}px`;
            bug.style.top = `${y}px`;
        });
        
        // 继续移动
        requestAnimationFrame(() => this.moveCavityBugs());
    }
    
    attackCavityBug(bug) {
        if (!this.gameActive) return;
        
        this.playSound(this.popSound);
        
        // 创建爆炸效果
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = bug.style.left;
        explosion.style.top = bug.style.top;
        this.toothModel.appendChild(explosion);
        
        // 移除蛀牙虫
        bug.remove();
        this.cavityBugs = this.cavityBugs.filter(b => b !== bug);
        
        // 增加分数
        this.score += 50;
        this.updateDisplay();
        
        // 检查是否击败所有蛀牙虫
        if (this.cavityBugs.length === 0) {
            this.playSound(this.winSound);
            this.gameMessage.textContent = '太棒了！所有蛀牙虫都被击败了！';
            setTimeout(() => this.nextLevel(), 1500);
        }
    }
    
    useToothpasteGun() {
        if (!this.gameActive) return;
        
        this.playSound(this.buttonSound);
        
        // 创建牙膏泡沫效果
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const foam = document.createElement('div');
                foam.className = 'foam';
                foam.style.left = `${Math.random() * (this.toothModel.offsetWidth - 20)}px`;
                foam.style.top = `${this.toothModel.offsetHeight - 20}px`;
                foam.style.width = `${Math.random() * 10 + 10}px`;
                foam.style.height = `${Math.random() * 10 + 10}px`;
                foam.style.opacity = `${Math.random() * 0.5 + 0.5}`;
                foam.style.animation = `float ${Math.random() * 1 + 1.5}s ease-out forwards`;
                this.toothModel.appendChild(foam);
                
                // 泡沫移动
                const speedX = (Math.random() - 0.5) * 2;
                let x = parseFloat(foam.style.left);
                
                const moveFoam = () => {
                    if (!foam) return;
                    x += speedX;
                    foam.style.left = `${x}px`;
                    requestAnimationFrame(moveFoam);
                };
                moveFoam();
                
                // 自动移除泡沫
                setTimeout(() => foam.remove(), 2000);
            }, i * 150);
        }
        
        this.gameMessage.textContent = '发射牙膏泡沫！';
    }
    
    useToothbrushSword() {
        if (!this.gameActive) return;
        
        this.playSound(this.buttonSound);
        
        // 创建多个剑击效果，从不同方向攻击
        const directions = [0, 45, 90, 135, 180];
        
        directions.forEach((angle, index) => {
            setTimeout(() => {
                const swordEffect = document.createElement('div');
                swordEffect.style.position = 'absolute';
                swordEffect.style.width = '120px';
                swordEffect.style.height = '12px';
                swordEffect.style.backgroundColor = '#ff6b6b';
                swordEffect.style.left = `${this.toothModel.offsetWidth / 2}px`;
                swordEffect.style.top = `${this.toothModel.offsetHeight / 2}px`;
                swordEffect.style.borderRadius = '6px';
                swordEffect.style.transformOrigin = 'left center';
                swordEffect.style.transform = `rotate(${angle}deg) scale(0)`;
                swordEffect.style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.8)';
                swordEffect.style.animation = 'swordSwing 0.6s ease-out forwards';
                this.toothModel.appendChild(swordEffect);
                
                // 添加剑击动画
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes swordSwing {
                        0% { transform: rotate(${angle}deg) scale(0); opacity: 1; }
                        50% { transform: rotate(${angle + 90}deg) scale(1.3); opacity: 1; box-shadow: 0 0 20px rgba(255, 107, 107, 1); }
                        100% { transform: rotate(${angle + 180}deg) scale(0); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
                
                // 自动移除剑击效果
                setTimeout(() => {
                    if (swordEffect) swordEffect.remove();
                    style.remove();
                }, 600);
            }, index * 100);
        });
        
        this.gameMessage.textContent = '使用牙刷剑！';
    }
    
    useSuperCleaner() {
        if (!this.gameActive) return;
        
        this.playSound(this.winSound);
        
        // 创建超级清洁效果
        const cleanerEffect = document.createElement('div');
        cleanerEffect.style.position = 'absolute';
        cleanerEffect.style.width = '100%';
        cleanerEffect.style.height = '100%';
        cleanerEffect.style.backgroundColor = 'rgba(155, 89, 182, 0.5)';
        cleanerEffect.style.borderRadius = '60px';
        cleanerEffect.style.animation = 'superClean 1s ease-out forwards';
        this.toothModel.appendChild(cleanerEffect);
        
        // 添加超级清洁动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes superClean {
                0% { transform: scale(0); opacity: 0.8; }
                50% { transform: scale(1.2); opacity: 0.6; }
                100% { transform: scale(1); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        // 清除所有食物残渣
        this.foodResidues.forEach(residue => {
            if (residue) {
                // 创建爆炸效果
                const explosion = document.createElement('div');
                explosion.className = 'explosion';
                explosion.style.left = residue.style.left;
                explosion.style.top = residue.style.top;
                this.toothModel.appendChild(explosion);
                
                // 移除残渣
                residue.remove();
            }
        });
        
        // 清空食物残渣数组
        const residueCount = this.foodResidues.length;
        this.foodResidues = [];
        
        // 增加分数
        this.score += residueCount * 10;
        this.updateDisplay();
        
        // 自动移除清洁效果
        setTimeout(() => {
            cleanerEffect.remove();
            style.remove();
            
            // 检查是否清除完所有残渣
            if (this.foodResidues.length === 0) {
                this.gameMessage.textContent = '食物残渣已清除！现在准备对抗蛀牙虫！';
                setTimeout(() => this.generateCavityBugs(), 1000);
            }
        }, 1000);
        
        this.gameMessage.textContent = '使用超级清洁剂！';
    }
    
    nextLevel() {
        // 根据得分给予评价
        let evaluation = '';
        if (this.score >= 300) {
            evaluation = '太棒了！你是口腔卫士！';
            this.playSound(this.winSound);
        } else if (this.score >= 200) {
            evaluation = '很好！继续保持！';
            this.playSound(this.winSound);
        } else {
            evaluation = '不错！再接再厉！';
            this.playSound(this.buttonSound);
        }
        
        this.gameMessage.textContent = `${evaluation}\n恭喜进入第${this.level + 1}关！`;
        
        this.level++;
        
        // 重置游戏区域并开始新关卡
        setTimeout(() => {
            this.clearGameArea();
            this.generateFoodResidues();
            this.updateDisplay();
        }, 2000);
    }
    
    updateDisplay() {
        this.levelDisplay.textContent = `关卡: ${this.level}`;
        this.scoreDisplay.textContent = `分数: ${this.score}`;
    }
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new CavityBugGame();
});