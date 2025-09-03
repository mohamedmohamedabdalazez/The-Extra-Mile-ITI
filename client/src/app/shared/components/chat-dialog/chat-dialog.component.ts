import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChatService } from '../../../core/services/chat.service';
import { AccountService } from '../../../core/services/account.service';
import { User } from '../../../shared/models/user';

type Message = { role: 'user' | 'assistant'; text: string };
const STORAGE_KEY = 'chat_history_v1';

@Component({
  selector: 'app-chat-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.scss']
})
export class ChatDialogComponent {
  private chat = inject(ChatService);
  private account = inject(AccountService);
  messages: Message[] = [];
  input = '';
  loading = false;
  private userKey = `${STORAGE_KEY}:anon`;

  constructor() {
    const user = this.account.currentUser();
    const identifier = user ? (user.email || (user as User).userName) : 'anon';
    this.userKey = `${STORAGE_KEY}:${identifier}`;
    this.loadHistory();
    if (this.messages.length === 0) {
      this.messages.push({ role: 'assistant', text: 'Hi! Ask me anything about our products.' });
    }
  }

  private loadHistory() {
    try {
      const session = this.chat.getSessionId();
      const raw = localStorage.getItem(`${this.userKey}:${session}`);
      if (raw) this.messages = JSON.parse(raw);
    } catch {}
  }

  private saveHistory() {
    try {
      const session = this.chat.getSessionId();
      localStorage.setItem(`${this.userKey}:${session}`, JSON.stringify(this.messages));
    } catch {}
  }

  async send() {
    const question = this.input.trim();
    if (!question || this.loading) return;
    this.messages.push({ role: 'user', text: question });
    this.input = '';
    this.loading = true;
    try {
      const res = await this.chat.ask(question);
      const formatted = this.formatAnswer(res?.answer ?? 'No answer.');
      this.messages.push({ role: 'assistant', text: formatted });
      this.saveHistory();
    } finally {
      this.loading = false;
      setTimeout(() => {
        const el = document.querySelector('.chat-body');
        if (el) el.scrollTop = el.scrollHeight;
      });
    }
  }

  private formatAnswer(text: string): string {
    // Simple formatting: convert "* " or "- " lists and bold markers **title**
    let html = text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\s*\*\s+/g, '\n- ');

    // Turn lines starting with - into list items
    const lines = html.split(/\n+/);
    const items: string[] = [];
    const blocks: string[] = [];
    for (const line of lines) {
      if (line.trim().startsWith('- ')) {
        items.push(`<li>${line.trim().substring(2)}</li>`);
      } else {
        if (items.length) {
          blocks.push(`<ul>${items.join('')}</ul>`);
          items.length = 0;
        }
        blocks.push(`<p>${line}</p>`);
      }
    }
    if (items.length) {
      blocks.push(`<ul>${items.join('')}</ul>`);
    }
    return blocks.join('');
  }
}


