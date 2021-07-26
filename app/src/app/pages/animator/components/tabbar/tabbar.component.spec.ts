import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { BaseService } from '@services/base/base.service';

import { TabbarComponent } from './tabbar.component';

describe('HeaderComponent', () => {
  let component: TabbarComponent;
  let fixture: ComponentFixture<TabbarComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [ TabbarComponent ],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [BaseService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
