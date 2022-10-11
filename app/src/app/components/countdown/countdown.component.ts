import { Component, OnInit, Input, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { CountdownState } from 'src/app/enums/countdown-state';

@Component({
    selector: 'app-countdown-component',
    templateUrl: './countdown.component.html',
    styleUrls: ['./countdown.component.scss']
})
export class CountdownComponent extends BaseComponent implements OnChanges, OnInit {

    @Input() duration: number;
    @Input() countdownState: CountdownState;
    @Output() stateEmitter = new EventEmitter();

    public counter: number = null;
    public interval: any;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes && changes.countdownState && changes.countdownState.currentValue === CountdownState.start) {
            this.startCounter();
        }
    }

    startCounter() {
        this.counter = this.duration;
        this.interval = setInterval(() => {
            this.counter--;
            if (this.counter <= 0) {
                this.counter = null;
                this.stateEmitter.emit(CountdownState.stop);
                clearInterval(this.interval);
            }
        }, 1000);
    }

    ngOnInit() {
        this.startCounter();
    }

}
