export enum StatusType {
  TOAST, //Toast提示或输入框提示
  NORMAL, //通用异常
  ACCESS, //访问异常
  SERVER, //服务异常
  END, //结束提示
}
export const StatusCode = {
  FAIL: 100,
  RESOURCE_NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  PARAMETER_INVALID: 600,
  LINK_INVALID: 705,
  ORDER_VALIDATE: 830,

  APPSECRET_NOT_CORRECT: 1000,
  APPSECRET_EXPIRED: 1001,
  APP_OFF_SHELF: 1003,
  APP_BEEN_DELETED: 1004,
  APPSECRET_NOT_VALID: 1005,

  RESOURCES_FULL: 1019,
  no_real_name_verification: 1020,
  app_not_synced: 1035,
  LOCAL_STORAGE_NOT_DISTRIBUTED: 1044,
  TOKEN_NOT_EXIST: 1101,
  NOT_IDLE_TOKEN: 1102,
  NICKNAME_EXIST: 1103,

  AMOUNT_NOT_ENOUGH: 2100,
  CAST_SCREEN_RUNNING: 3001,
  CAST_SCREEN_NOT_RUN: 3002,
  CAST_SCREEN_PWD_ERROR: 3003,
  CAST_SCREEN_PWD_SAME: 3005,
};

export const StatusMap = new Map<number, [StatusType, string]>([
  [StatusCode.FAIL, [StatusType.NORMAL, "失败"]],
  [
    StatusCode.RESOURCE_NOT_FOUND,  
    [StatusType.NORMAL, "平台暂无可用资源，请稍后再试"],
  ],
  [StatusCode.INTERNAL_ERROR, [StatusType.NORMAL, "服务器处理失败"]],
  [StatusCode.PARAMETER_INVALID, [StatusType.NORMAL, "非法参数"]],
  [StatusCode.LINK_INVALID, [StatusType.ACCESS, "该链接已不存在"]],
  [StatusCode.ORDER_VALIDATE, [StatusType.ACCESS, "订单已失效,请您联系客服处理"]],

  [StatusCode.APPSECRET_NOT_CORRECT, [StatusType.TOAST, "访问密钥错误"]],
  [StatusCode.APPSECRET_EXPIRED, [StatusType.ACCESS, "链接已过期"]],
  [StatusCode.APP_OFF_SHELF, [StatusType.ACCESS, "应用已下架"]],
  [StatusCode.APP_BEEN_DELETED, [StatusType.ACCESS, "应用已删除"]],
  [StatusCode.APPSECRET_NOT_VALID, [StatusType.ACCESS, "链接未生效"]],

  [
    StatusCode.RESOURCES_FULL,
    [StatusType.ACCESS, "当前资源已被占满，请稍后再试"],
  ],
  [
    StatusCode.no_real_name_verification,
    [StatusType.TOAST, "需进行实名认证后，才能访问应用"],
  ],
  [StatusCode.app_not_synced, [StatusType.SERVER, "共享存储未同步完成"]],
  [
    StatusCode.LOCAL_STORAGE_NOT_DISTRIBUTED,
    [StatusType.SERVER, "本地存储未同步完成"],
  ],
  [StatusCode.TOKEN_NOT_EXIST, [StatusType.ACCESS, "token不存在"]],
  [StatusCode.NOT_IDLE_TOKEN, [StatusType.ACCESS, "投屏端数量已到达上限"]],
  [StatusCode.NICKNAME_EXIST, [StatusType.TOAST, "昵称已存在"]],

  [
    StatusCode.AMOUNT_NOT_ENOUGH,
    [StatusType.SERVER, "余额不足，请充值后再打开应用"],
  ],
  [StatusCode.CAST_SCREEN_RUNNING, [StatusType.ACCESS, "投屏正在运行"]],
  [StatusCode.CAST_SCREEN_NOT_RUN, [StatusType.ACCESS, "主控端未开启"]],
  [StatusCode.CAST_SCREEN_PWD_ERROR, [StatusType.TOAST, "口令错误"]],
  [StatusCode.CAST_SCREEN_PWD_SAME, [StatusType.TOAST, "该口令已被创建使用"]],
]);
