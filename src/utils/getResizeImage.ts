export const getResizeImage = (
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
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

      img.onerror = (error) => reject(error);
    };

    reader.onerror = (error) => reject(error);
  });
};
