// async function fun1() {
//   let promiseArr = [];
//   const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
//   arr.forEach((item) => {
//     const promiseItem = new Promise(async (resolve, reject) => {
//       await fun2(item);
//       resolve();
//     });
//     promiseArr.push(promiseItem);
//   });
//   await Promise.all(promiseArr).then(() => {
//     console.log("ALL THEN");
//   });
//   console.log("ALL NEXT");
// }
// fun1();

// async function fun2(item) {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       console.log(item);
//       resolve();
//     }, 1000);
//   });
// }

function fun1() {
  return new Promise((resolve, reject) => {
    // throw new Error("ERR错误");
    reject("ERR错误");
  });
}

// Promise自己的异常只能被自己catch, 或在try/catch里以await的方式调用来捕获。否则就会作为ERR_UNHANDLED_REJECTION异常抛出到全局。
async function fun2() {
  try {
    await fun1();
  } catch (err) {
    console.log(err);
  }
}

fun2()