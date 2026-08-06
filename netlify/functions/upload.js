exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);

        // 1. KIỂM TRA BẢO MẬT (AUTH)
        const ADMIN_USER = process.env.ADMIN_USER;
        const ADMIN_PASS = process.env.ADMIN_PASS;

        if (body.username !== ADMIN_USER || body.password !== ADMIN_PASS) {
            return { 
                statusCode: 401, 
                body: JSON.stringify({ message: "Sai tài khoản hoặc mật khẩu!" }) 
            };
        }

        // Nếu request chỉ là để kiểm tra đăng nhập (từ form login)
        if (body.action === 'verify') {
            return { statusCode: 200, body: JSON.stringify({ message: "Đăng nhập thành công!" }) };
        }

        // 2. XỬ LÝ UPLOAD ẢNH LÊN GITHUB
        const imageBase64 = body.image.split(',')[1];
        const filename = body.filename;
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const GITHUB_USER = process.env.GITHUB_USER;
        const GITHUB_REPO = process.env.GITHUB_REPO;

        const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/images/${filename}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Upload ảnh: ${filename}`,
                content: imageBase64
            })
        });

        if (!response.ok) {
            throw new Error('Không thể kết nối với GitHub. Vui lòng kiểm tra lại GITHUB_TOKEN.');
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Upload thành công! Web đang tự động cập nhật..." }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message }),
        };
    }
};
