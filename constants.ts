export const WORDS = [
  "孤独", "海洋", "渴望", "燃烧", "时间", "记忆", "星辰", "深渊", "回声", "梦境",
  "虚无", "永恒", "灵魂", "流浪", "光芒", "暗影", "呢喃", "彼岸", "信号", "遗忘",
  "诞生", "毁灭", "静默", "喧嚣", "宿命", "自由", "枷锁", "呼吸", "心跳", "眼泪",
  "微笑", "黎明", "黄昏", "迷雾", "幻影", "真实", "谎言", "信仰", "背叛", "救赎",
  "沉睡", "苏醒", "追寻", "逃避", "相遇", "别离", "重逢", "陌生", "熟悉", "未知"
];

export const generateBraille = (word: string) => {
  const brailleChars = '⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿';
  let result = '';
  for (let i = 0; i < word.length * 2; i++) {
    result += brailleChars[Math.floor(Math.random() * brailleChars.length)];
  }
  return result;
};
