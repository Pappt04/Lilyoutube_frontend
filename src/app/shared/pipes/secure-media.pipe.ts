import { Pipe, PipeTransform, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, map, of } from 'rxjs';

@Pipe({
    name: 'secureMedia',
    standalone: true
})
export class SecureMediaPipe implements PipeTransform {
    private http = inject(HttpClient);
    private sanitizer = inject(DomSanitizer);

    transform(url: string | null): Observable<SafeUrl | string> {
        if (!url) {
            return of('/images/default_thumbnail.png');
        }

        return this.http.get(url, { responseType: 'blob' }).pipe(
            map(blob => {
                const objectUrl = URL.createObjectURL(blob);
                return this.sanitizer.bypassSecurityTrustUrl(objectUrl);
            })
        );
    }
}
