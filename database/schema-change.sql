-- Changes applied to the provided database.
-- Run once, in order, before starting the API.
-- (Running a second time fails with "Duplicate column name", which is expected.)

-- 1. department.location
--    The assignment asks for a location/floor on each department, but the
--    provided table has no such column.
ALTER TABLE department
  ADD COLUMN location VARCHAR(100) NULL
    COMMENT 'สถานที่ตั้ง/ชั้น เช่น ตึก A ชั้น 3'
    AFTER head_employee_id;

-- 2. department.deleted_at
--    Soft delete, the same pattern as employee.deleted_at. NULL means active.
--    The row is kept so employee_department_history can still reference it.
ALTER TABLE department
  ADD COLUMN deleted_at DATETIME NULL
    COMMENT 'วันเวลาที่ลบข้อมูล (Soft Delete), NULL = ยังไม่ถูกลบ';

-- 3. Index used by report.sql
--    Filters by gender first (equality), then by a birth date range.
CREATE INDEX idx_employee_gender_birth
  ON employee (gender_id, birth_date)
  COMMENT 'ช่วยให้ query ใน report.sql เร็วขึ้น ด้วย index: gender filter, then birth date range';