exports.handler = async (event, context) => {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_USER = process.env.GITHUB_USER;
    const GITHUB_REPO = process.env.GITHUB_REPO;

    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/images`, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return { statusCode: 200, body: JSON.stringify([]) };
            }
            throw new Error('Không thể lấy dữ liệu từ GitHub');
        }

        const data = await response.json();
        
        const images = data
            .filter(file => file.type === 'file' && file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
            .sort((a, b) => b.name.localeCompare(a.name))
            // THAY ĐỔI QUAN TRỌNG Ở ĐÂY: 
            // Dùng file.download_url để lấy link ảnh raw trực tiếp từ GitHub thay vì link local
            .map(file => file.download_url); 

        return {
            statusCode: 200,
            body: JSON.stringify(images),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
