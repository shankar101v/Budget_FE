import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css'
})
export class ConfirmDialog {

  @Input() title = 'Confirm Action';

  @Input() message = 'Are you sure you want to continue?';

  @Input() confirmText = 'Delete';

  @Input() cancelText = 'Cancel';

  @Output() confirmed = new EventEmitter<void>();

  @Output() cancelled = new EventEmitter<void>();


  onConfirm(): void {
    this.confirmed.emit();
  }


  onCancel(): void {
    this.cancelled.emit();
  }

}