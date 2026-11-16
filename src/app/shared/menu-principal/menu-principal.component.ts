import {Component, inject, OnInit} from '@angular/core';
import {SidebarMenuService} from '../../services/sidebar-menu.service';
import {Router} from '@angular/router';
import {MenuSection} from '../../core/models/menu-item.model';

@Component({
  selector: 'app-menu-principal',
  imports: [],
  standalone: true,
  templateUrl: './menu-principal.component.html',
  styleUrl: './menu-principal.component.scss'
})
export class MenuPrincipalComponent implements OnInit {
  private sidebarMenuService = inject(SidebarMenuService);
  private router = inject(Router);
  menuSections: MenuSection[] = [];

  ngOnInit(): void {
    this.sidebarMenuService.getSidebarMenus().subscribe(sections => {
      this.menuSections = sections;
    });
  }

  naviguer(route: string | undefined): void {
    if (route) this.router.navigate([route]);
  }
}
