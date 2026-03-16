/*
  # Update menu items

  1. Changes
    - Delete all menu items
    - Add only the required categories: Chips, Schnitzel, Ice Cream, Cold Drinks, Soda
*/

DELETE FROM menu_items;

INSERT INTO menu_items (name, description, price, category, image_url, available) VALUES
('ציפס רגיל', 'ציפס בלגי פריך וזהוב', 15.00, 'ציפס', 'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('ציפס גדול', 'ציפס בלגי במנה גדולה', 20.00, 'ציפס', 'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('ציפס עם גבינה', 'ציפס עם גבינה צהובה מומסת', 25.00, 'ציפס', 'https://images.pexels.com/photos/2271107/pexels-photo-2271107.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('שניצל קטן', 'שניצל זהוב ופריך', 28.00, 'שניצלים', 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('שניצל גדול', 'שניצל זהוב ופריך במנה גדולה', 38.00, 'שניצלים', 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('ארטיק שוקולד', 'ארטיק שוקולד קפוא', 8.00, 'ארטיקים', 'https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('ארטיק וניל', 'ארטיק וניל קפוא', 8.00, 'ארטיקים', 'https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('גלידה מוגנזת', 'גלידה מוגנזת בטעמים שונים', 12.00, 'ארטיקים', 'https://images.pexels.com/photos/1098516/pexels-photo-1098516.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('קולה', 'קוקה קולה קפואה', 10.00, 'משקאות', 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('ספרייט', 'ספרייט קפוא', 10.00, 'משקאות', 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('פאנטה תפוזים', 'פאנטה תפוזים קפואה ומוגזת', 10.00, 'משקאות', 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('מים מינרליים', 'בקבוק מים מינרליים קפוא', 5.00, 'משקאות', 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=800', true);