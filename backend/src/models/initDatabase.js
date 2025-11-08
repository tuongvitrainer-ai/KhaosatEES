const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbPath = path.join(__dirname, '../../', process.env.DATABASE_PATH);
const schemaPath = path.join(__dirname, 'schema.sql');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✓ Created data directory');
}

// Read schema file
const schema = fs.readFileSync(schemaPath, 'utf8');

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('✗ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✓ Connected to SQLite database');
});

// Execute schema
db.exec(schema, (err) => {
  if (err) {
    console.error('✗ Error creating schema:', err.message);
    db.close();
    process.exit(1);
  }
  console.log('✓ Database schema created successfully');

  // Create default admin user
  createDefaultAdmin();
});

function createDefaultAdmin() {
  const adminData = {
    employee_id: process.env.ADMIN_EMPLOYEE_ID || 'admin',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    full_name: process.env.ADMIN_NAME || 'System Administrator',
    email: process.env.ADMIN_EMAIL || 'admin@company.com',
  };

  // Check if admin already exists
  db.get(
    'SELECT id FROM users WHERE employee_id = ?',
    [adminData.employee_id],
    (err, row) => {
      if (err) {
        console.error('✗ Error checking admin:', err.message);
        db.close();
        return;
      }

      if (row) {
        console.log('ℹ Admin user already exists');
        createSampleSurvey();
        return;
      }

      // Hash password and create admin
      bcrypt.hash(adminData.password, 10, (err, hash) => {
        if (err) {
          console.error('✗ Error hashing password:', err.message);
          db.close();
          return;
        }

        db.run(
          `INSERT INTO users (employee_id, password_hash, full_name, email, is_admin, is_active)
           VALUES (?, ?, ?, ?, 1, 1)`,
          [adminData.employee_id, hash, adminData.full_name, adminData.email],
          function (err) {
            if (err) {
              console.error('✗ Error creating admin user:', err.message);
              db.close();
              return;
            }

            console.log('✓ Admin user created successfully');
            console.log(`  Employee ID: ${adminData.employee_id}`);
            console.log(`  Password: ${adminData.password}`);
            console.log('  ⚠ Please change the default password after first login!');

            createSampleSurvey();
          }
        );
      });
    }
  );
}

function createSampleSurvey() {
  // Check if survey already exists
  db.get('SELECT id FROM surveys WHERE id = 1', (err, row) => {
    if (err) {
      console.error('✗ Error checking survey:', err.message);
      db.close();
      return;
    }

    if (row) {
      console.log('ℹ Sample survey already exists');
      db.close();
      console.log('\n✓ Database initialization complete!');
      return;
    }

    // Create sample survey
    const surveyData = {
      title: 'Khảo sát mức độ gắn bó nhân viên 2024',
      description: 'Khảo sát đánh giá mức độ gắn bó và sự hài lòng của nhân viên với tổ chức',
      instructions: 'Vui lòng trả lời tất cả các câu hỏi một cách trung thực. Thông tin của bạn sẽ được bảo mật.',
      likert_scale: 5,
      is_active: 1,
      created_by: 1,
    };

    db.run(
      `INSERT INTO surveys (title, description, instructions, likert_scale, is_active, created_by, start_date)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        surveyData.title,
        surveyData.description,
        surveyData.instructions,
        surveyData.likert_scale,
        surveyData.is_active,
        surveyData.created_by,
      ],
      function (err) {
        if (err) {
          console.error('✗ Error creating survey:', err.message);
          db.close();
          return;
        }

        const surveyId = this.lastID;
        console.log('✓ Sample survey created');

        // Create sample categories and questions
        createSampleQuestions(surveyId);
      }
    );
  });
}

function createSampleQuestions(surveyId) {
  const categories = [
    { name: 'Môi trường làm việc', description: 'Đánh giá về môi trường và điều kiện làm việc', order: 1 },
    { name: 'Lãnh đạo và quản lý', description: 'Đánh giá về phong cách lãnh đạo và quản lý', order: 2 },
    { name: 'Phát triển nghề nghiệp', description: 'Đánh giá cơ hội phát triển và đào tạo', order: 3 },
    { name: 'Đãi ngộ và phúc lợi', description: 'Đánh giá về lương thưởng và phúc lợi', order: 4 },
    { name: 'Văn hóa tổ chức', description: 'Đánh giá về văn hóa và giá trị tổ chức', order: 5 },
  ];

  let categoriesCreated = 0;
  const categoryIds = {};

  categories.forEach((cat) => {
    db.run(
      `INSERT INTO question_categories (survey_id, name, description, display_order)
       VALUES (?, ?, ?, ?)`,
      [surveyId, cat.name, cat.description, cat.order],
      function (err) {
        if (err) {
          console.error('✗ Error creating category:', err.message);
          return;
        }

        categoryIds[cat.name] = this.lastID;
        categoriesCreated++;

        if (categoriesCreated === categories.length) {
          insertQuestions(surveyId, categoryIds);
        }
      }
    );
  });
}

function insertQuestions(surveyId, categoryIds) {
  const questions = [
    // Môi trường làm việc
    { cat: 'Môi trường làm việc', text: 'Tôi hài lòng với môi trường làm việc tại công ty', order: 1 },
    { cat: 'Môi trường làm việc', text: 'Nơi làm việc của tôi có đầy đủ trang thiết bị cần thiết', order: 2 },
    { cat: 'Môi trường làm việc', text: 'Công ty tạo điều kiện cân bằng giữa công việc và cuộc sống', order: 3 },
    { cat: 'Môi trường làm việc', text: 'Tôi cảm thấy an toàn khi làm việc tại công ty', order: 4 },

    // Lãnh đạo và quản lý
    { cat: 'Lãnh đạo và quản lý', text: 'Cấp trên trực tiếp của tôi lắng nghe và tôn trọng ý kiến của nhân viên', order: 5 },
    { cat: 'Lãnh đạo và quản lý', text: 'Tôi nhận được sự hỗ trợ cần thiết từ cấp trên khi gặp khó khăn', order: 6 },
    { cat: 'Lãnh đạo và quản lý', text: 'Cấp trên của tôi đưa ra mục tiêu và kỳ vọng rõ ràng', order: 7 },
    { cat: 'Lãnh đạo và quản lý', text: 'Tôi tin tưởng vào năng lực lãnh đạo của ban quản lý công ty', order: 8 },

    // Phát triển nghề nghiệp
    { cat: 'Phát triển nghề nghiệp', text: 'Công ty tạo cơ hội để tôi phát triển kỹ năng và năng lực', order: 9 },
    { cat: 'Phát triển nghề nghiệp', text: 'Tôi có cơ hội thăng tiến nghề nghiệp tại công ty', order: 10 },
    { cat: 'Phát triển nghề nghiệp', text: 'Công ty hỗ trợ các chương trình đào tạo phù hợp với công việc', order: 11 },
    { cat: 'Phát triển nghề nghiệp', text: 'Tôi thấy tương lai nghề nghiệp của mình gắn liền với công ty', order: 12 },

    // Đãi ngộ và phúc lợi
    { cat: 'Đãi ngộ và phúc lợi', text: 'Tôi hài lòng với mức lương hiện tại', order: 13 },
    { cat: 'Đãi ngộ và phúc lợi', text: 'Chính sách thưởng của công ty công bằng và hợp lý', order: 14 },
    { cat: 'Đãi ngộ và phúc lợi', text: 'Các chế độ phúc lợi của công ty đáp ứng nhu cầu của tôi', order: 15 },
    { cat: 'Đãi ngộ và phúc lợi', text: 'Tôi nhận được sự công nhận và khen thưởng xứng đáng cho công việc', order: 16 },

    // Văn hóa tổ chức
    { cat: 'Văn hóa tổ chức', text: 'Tôi tự hào khi làm việc tại công ty', order: 17 },
    { cat: 'Văn hóa tổ chức', text: 'Các giá trị văn hóa công ty phù hợp với giá trị cá nhân của tôi', order: 18 },
    { cat: 'Văn hóa tổ chức', text: 'Đồng nghiệp của tôi làm việc hợp tác và hỗ trợ lẫn nhau', order: 19 },
    { cat: 'Văn hóa tổ chức', text: 'Tôi sẵn sàng giới thiệu công ty như một nơi làm việc tốt', order: 20 },
  ];

  let questionsCreated = 0;

  questions.forEach((q) => {
    db.run(
      `INSERT INTO questions (survey_id, category_id, question_text, question_type, is_required, display_order)
       VALUES (?, ?, ?, 'likert', 1, ?)`,
      [surveyId, categoryIds[q.cat], q.text, q.order],
      (err) => {
        if (err) {
          console.error('✗ Error creating question:', err.message);
          return;
        }

        questionsCreated++;

        if (questionsCreated === questions.length) {
          console.log(`✓ Created ${questionsCreated} sample questions`);
          db.close();
          console.log('\n✓ Database initialization complete!');
          console.log('\nYou can now start the server with: npm start');
        }
      }
    );
  });
}
