import { Component, OnInit, OnChanges } from '@angular/core';
import { of, from, Observable, bindCallback, Subject, fromEvent } from 'rxjs';
import { map, filter, delay, throttleTime, debounceTime, pluck, pairwise, distinct, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
  title = 'app';

  async ngOnInit() {
    /*******************
     ***** 转换
     *******************/
    let ob = null;
    // 来自一个或多个值
    ob = of(1);

    // 来自数组
    ob = from([1, 2, 3]);

    // 来自Event
    ob = fromEvent(document.querySelector('button'), 'click');

    // 来自回调函数(函数的最后一个参数得是回调函数，比如下面的 cb)
    ob = bindCallback(this.cb);
    // ob(1).subscribe(data => console.log(data));
    await ob(1).toPromise().then(data => console.log(data));

    /*******************
     ***** 创建
     *******************/
    // 在外部产生新事件
    const subject = new Subject();
    subject.subscribe(data => console.log('在外部产生观察，并进行订阅:' + data)); // 订阅: 先订阅 - 订阅的是新内容
    subject.next('新的一期'); // 装载: 装载新内容
    // ob = subject.asObservable(); // 通过Subject生成Observable

    // 在内部产生新事件
    ob = Observable.create(observer => {
      observer.next('第1期');
      // setTimeout(() => observer.next('第2期'), 1000);
    });
    ob.subscribe(data => console.log('在内部产生观察，并进行订阅:' + data)); // 订阅: 先订阅 - 订阅的是新内容

    /*******************
     ***** 控制流动
     *******************/
    const input = fromEvent(document.querySelector('input'), 'input');
    ob = from([1, 2, 3]);
    // 过滤、映射
    ob.pipe(
      filter(res => res > 1),
      map((res: any) => {
        return res * 2;
      })
    ).subscribe(res => console.log('控制流 - 过滤、映射: ' + res));

    // 延迟
    ob.pipe(delay(2000)).subscribe(res => console.log('控制流 - 延迟: ' + res));

    // 节流 - 水龙头
    input.pipe(throttleTime(2000)).subscribe(res => console.log('控制流 - 节流: ' + res)); // 每2秒只能通过一个事件

    // 去抖 - 弹簧
    input
      .pipe(
        debounceTime(200),
        map(event => event.target)
      )
      .subscribe(res => console.log('控制流 - 去抖: ' + res)); // 停顿监测 - 输入后200ms方能通过最新的那个事件

    /*******************
     ***** 产生值
     *******************/
    // 映射
    input.pipe(map(event => event.target)).subscribe(res => console.log('产生值 - 映射: ' + res));
    // 采摘 - 通过属性提取值
    input.pipe(pluck('target', 'value')).subscribe(res => console.log('产生值 - 提取属性: ' + res));
    // 成对
    input.pipe(pluck('target', 'value'), pairwise()).subscribe(res => console.log('产生值 - 传递之前两个值: ' + res));
    // 唯一
    input.pipe(pluck('data'), distinct()).subscribe(res => console.log('产生值 - 只会通过唯一的值: ' + res));
    // 去重 - 不连续相同
    input.pipe(pluck('data'), distinctUntilChanged()).subscribe(res => console.log('产生值 - 不会传递连续重复的值: ' + res));

    /*******************
     ***** 状态和存储 (State Store)
     *******************/
  }

  // 定义回调函数
  cb(x, selfFunc) {
    setTimeout(() => {
      selfFunc('回调函数方式转换:' + x);
    }, 0);
  }
}
