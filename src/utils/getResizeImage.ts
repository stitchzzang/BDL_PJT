export const getResizeImage = (
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // 파일 크기 체크 (10MB)
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      reject(new Error('최대 파일 업로드 사이즈는 10MB입니다.'));
      return;
    }

    // 파일 타입 체크
    const validFileTypes = ['image/jpeg', 'image/png'];
    if (!validFileTypes.includes(file.type)) {
      reject(new Error('적합하지 않은 이미지입니다. 다른 이미지를 선택해주세요.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        // 이미지 크기 체크
        if (img.width < 50 || img.height < 50) {
          reject(new Error('적합하지 않은 이미지입니다. 다른 이미지를 선택해주세요.'));
          return;
        }

        if (img.width > 4000 || img.height > 4000) {
          reject(new Error('적합하지 않은 이미지입니다. 다른 이미지를 선택해주세요.'));
          return;
        }

        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 이미지 비율 유지하면서 리사이즈
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context를 생성할 수 없습니다.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // 리사이즈된 이미지를 File 객체로 변환
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('이미지 변환에 실패했습니다.'));
              return;
            }

            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(resizedFile);
          },
          file.type,
          0.8, // 품질 설정 (0.8 = 80% 품질)
        );
      };

      img.onerror = () => {
        reject(new Error('적합하지 않은 이미지입니다. 다른 이미지를 선택해주세요.'));
      };
    };

    reader.onerror = (error) => reject(error);
  });
};
