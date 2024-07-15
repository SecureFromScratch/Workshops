import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipesCatalogComponent } from './recipes-catalog.component';

describe('RecipesCatalogComponent', () => {
  let component: RecipesCatalogComponent;
  let fixture: ComponentFixture<RecipesCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecipesCatalogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecipesCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
