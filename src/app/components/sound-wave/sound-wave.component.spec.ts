import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundWaveComponent } from './sound-wave.component';

describe('SoundWaveComponent', () => {
  let component: SoundWaveComponent;
  let fixture: ComponentFixture<SoundWaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SoundWaveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoundWaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});




