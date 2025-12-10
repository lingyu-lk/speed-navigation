// ==================== Extended Pinyin Map ====================
// 扩展的拼音映射表，支持更多常用汉字
const PINYIN_MAP = {
    // 常用字
    '哔': 'bi', '哩': 'li', '网': 'wang', '易': 'yi', '云': 'yun',
    '音': 'yin', '乐': 'le', '知': 'zhi', '乎': 'hu', '微': 'wei',
    '博': 'bo', '淘': 'tao', '宝': 'bao', '京': 'jing', '东': 'dong',
    '天': 'tian', '猫': 'mao', '拼': 'pin', '多': 'duo', '斗': 'dou',
    '鱼': 'yu', '爱': 'ai', '奇': 'qi', '艺': 'yi', '小': 'xiao',
    '红': 'hong', '书': 'shu', '虎': 'hu', '嗅': 'xiu', '百': 'bai',
    '度': 'du', '盘': 'pan', '阿': 'a', '里': 'li', '搜': 'sou',
    '狗': 'gou', '腾': 'teng', '讯': 'xun', '新': 'xin', '浪': 'lang',
    '网': 'wang', '抖': 'dou', '音': 'yin', '快': 'kuai', '手': 'shou',

    // 数字
    '零': 'ling', '一': 'yi', '二': 'er', '三': 'san', '四': 'si',
    '五': 'wu', '六': 'liu', '七': 'qi', '八': 'ba', '九': 'jiu',
    '十': 'shi', '百': 'bai', '千': 'qian', '万': 'wan',

    // 常见词汇
    '我': 'wo', '的': 'de', '你': 'ni', '他': 'ta', '她': 'ta',
    '们': 'men', '这': 'zhe', '那': 'na', '有': 'you', '没': 'mei',
    '在': 'zai', '是': 'shi', '不': 'bu', '了': 'le', '人': 'ren',
    '个': 'ge', '上': 'shang', '下': 'xia', '来': 'lai', '去': 'qu',
    '出': 'chu', '到': 'dao', '时': 'shi', '要': 'yao', '以': 'yi',
    '会': 'hui', '可': 'ke', '看': 'kan', '得': 'de', '说': 'shuo',

    // 科技相关
    '科': 'ke', '技': 'ji', '电': 'dian', '脑': 'nao', '手': 'shou',
    '机': 'ji', '软': 'ruan', '件': 'jian', '硬': 'ying', '应': 'ying',
    '用': 'yong', '程': 'cheng', '序': 'xu', '代': 'dai', '码': 'ma',
    '编': 'bian', '程': 'cheng', '开': 'kai', '发': 'fa', '设': 'she',
    '计': 'ji', '互': 'hu', '联': 'lian', '智': 'zhi', '能': 'neng',

    // 常见网站相关
    '社': 'she', '交': 'jiao', '媒': 'mei', '体': 'ti', '视': 'shi',
    '频': 'pin', '直': 'zhi', '播': 'bo', '游': 'you', '戏': 'xi',
    '购': 'gou', '物': 'wu', '支': 'zhi', '付': 'fu', '理': 'li',
    '财': 'cai', '金': 'jin', '融': 'rong', '学': 'xue', '习': 'xi',
    '教': 'jiao', '育': 'yu', '资': 'zi', '讯': 'xun', '新': 'xin',
    '闻': 'wen', '图': 'tu', '片': 'pian', '文': 'wen', '档': 'dang',
    '云': 'yun', '存': 'cun', '储': 'chu', '工': 'gong', '具': 'ju'
};

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PINYIN_MAP;
}
