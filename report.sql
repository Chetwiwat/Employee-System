WITH emp AS (
  SELECT
    e.employee_code,
    CONCAT(e.first_name, ' ', e.last_name)       AS full_name,
    e.birth_date,
    TIMESTAMPDIFF(YEAR, e.birth_date, CURDATE()) AS age,
    e.department_id
  FROM employee e
  JOIN master_gender g ON g.id = e.gender_id
  WHERE e.deleted_at IS NULL
    AND g.gender_code = 'M'
)
SELECT emp.employee_code, emp.full_name, emp.birth_date, emp.age, d.department_name
FROM emp
LEFT JOIN department d ON d.id = emp.department_id AND d.deleted_at IS NULL
WHERE emp.age BETWEEN 25 AND 35
ORDER BY d.department_name, emp.age;