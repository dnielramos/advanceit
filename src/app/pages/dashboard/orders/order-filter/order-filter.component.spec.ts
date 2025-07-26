import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderFilterComponent } from './order-filter.component';

describe('OrderFilterComponent', () => {
    let component: OrderFilterComponent;
    let fixture: ComponentFixture<OrderFilterComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ OrderFilterComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OrderFilterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
