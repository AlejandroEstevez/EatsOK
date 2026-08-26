
-- EatsOK full demo seed: users, establishments, dishes, tags, recipes and reviews
-- Focused on central Madrid. Businesses/reviews are fictional demo content.
-- Named demo users are placeholders only; they do not represent real activity.

BEGIN;

DO $$
DECLARE
    v_owner_id bigint;
BEGIN
    SELECT id
    INTO v_owner_id
    FROM users_user
    WHERE UPPER(role::text) = 'OWNER'
    ORDER BY id
    LIMIT 1;

    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION
            'No OWNER user found in users_user. Create one or adjust the role condition in the seed.';
    END IF;

    -- ============================================================
    -- CLEAN PREVIOUS DEMO DATA
    -- ============================================================

    -- Reviews created by demo users or attached to demo content.
    DELETE FROM reviews_review
    WHERE author_id IN (
        SELECT id
        FROM users_user
        WHERE email LIKE '%@demo-user.eatsok.local'
    )
    OR establishment_id IN (
        SELECT id
        FROM establishments_establishment
        WHERE email LIKE '%@demo.eatsok.local'
    )
    OR recipe_id IN (
        SELECT id
        FROM recipes_recipe
        WHERE title LIKE '[DEMO]%'
    );

    -- Recipe restrictions from demo recipes.
    DELETE FROM recipes_reciperestriction
    WHERE recipe_id IN (
        SELECT id
        FROM recipes_recipe
        WHERE title LIKE '[DEMO]%'
        OR author_id IN (
            SELECT id
            FROM users_user
            WHERE email LIKE '%@demo-user.eatsok.local'
        )
    );

    -- Demo recipes.
    DELETE FROM recipes_recipe
    WHERE title LIKE '[DEMO]%'
       OR author_id IN (
            SELECT id
            FROM users_user
            WHERE email LIKE '%@demo-user.eatsok.local'
       );

    -- Dish restrictions.
    DELETE FROM establishments_dishrestriction
    WHERE dish_id IN (
        SELECT d.id
        FROM establishments_dish d
        JOIN establishments_establishment e
            ON e.id = d.establishment_id
        WHERE e.email LIKE '%@demo.eatsok.local'
    );

    -- Dishes.
    DELETE FROM establishments_dish
    WHERE establishment_id IN (
        SELECT id
        FROM establishments_establishment
        WHERE email LIKE '%@demo.eatsok.local'
    );

    -- Establishment tags.
    DELETE FROM establishments_establishment_tags
    WHERE establishment_id IN (
        SELECT id
        FROM establishments_establishment
        WHERE email LIKE '%@demo.eatsok.local'
    );

    -- Locations.
    DELETE FROM establishments_location
    WHERE establishment_id IN (
        SELECT id
        FROM establishments_establishment
        WHERE email LIKE '%@demo.eatsok.local'
    );

    -- Establishments.
    DELETE FROM establishments_establishment
    WHERE email LIKE '%@demo.eatsok.local';

    -- Demo client users are removed last, once their dependent content is gone.
    DELETE FROM users_user
    WHERE email LIKE '%@demo-user.eatsok.local';


    -- ----------------------------
    -- DEMO CLIENT USERS
    -- ----------------------------
    --
    -- These are presentation/test accounts only. The password value "!" is
    -- Django's unusable-password prefix, so these rows cannot be used to log in.
    -- Names of public figures/game characters are only fictional demo data.

    INSERT INTO users_user (
        password,
        last_login,
        is_superuser,
        username,
        first_name,
        last_name,
        email,
        is_staff,
        is_active,
        date_joined,
        role
    )
    VALUES
        ('!', NULL, FALSE, 'adela.moyano', 'Adela', 'Moyano',
         'adela.moyano@demo-user.eatsok.local', FALSE, TRUE, NOW(), 'CLIENT'),

        ('!', NULL, FALSE, 'carmen.boto', 'Carmen', 'Boto',
         'carmen.boto@demo-user.eatsok.local', FALSE, TRUE, NOW(), 'CLIENT'),

        ('!', NULL, FALSE, 'alvaro.estevez', 'Álvaro', 'Estévez',
         'alvaro.estevez@demo-user.eatsok.local', FALSE, TRUE, NOW(), 'CLIENT'),

        ('!', NULL, FALSE, 'francisco.estevez', 'Francisco', 'Estévez',
         'francisco.estevez@demo-user.eatsok.local', FALSE, TRUE, NOW(), 'CLIENT'),

        ('!', NULL, FALSE, 'blanca.estevez', 'Blanca', 'Estévez',
         'blanca.estevez@demo-user.eatsok.local', FALSE, TRUE, NOW(), 'CLIENT'),

        ('!', NULL, FALSE, 'antonio.moyano', 'Antonio', 'Moyano',
         'antonio.moyano@demo-user.eatsok.local', FALSE, TRUE, NOW(), 'CLIENT'),

        ('!', NULL, FALSE, 'irene.arnau', 'Irene', 'Arnau',
         'irene.arnau@demo-user.eatsok.local', FALSE, TRUE, NOW(), 'CLIENT'),

        ('!', NULL, FALSE, 'miriam.arnau', 'Miriam', 'Arnau',
         'miriam.arnau@demo-user.eatsok.local', FALSE, TRUE, NOW(), 'CLIENT'),

        ('!', NULL, FALSE, 'carlota.niemeyer', 'Carlota', 'Niemeyer',
         'carlota.niemeyer@demo-user.eatsok.local', FALSE, TRUE, NOW(), 'CLIENT'),

        ('!', NULL, FALSE, 'dani.moyano', 'Dani', 'Moyano',
         'dani.moyano@demo-user.eatsok.local', FALSE, TRUE, NOW(), 'CLIENT'),

        ('!', NULL, FALSE, 'nico.moyano', 'Nico', 'Moyano',
         'nico.moyano@demo-user.eatsok.local', FALSE, TRUE, NOW(), 'CLIENT'),

        ('!', NULL, FALSE, 'pau.cubarsi', 'Pau', 'Cubarsí',
         'pau.cubarsi@demo-user.eatsok.local', FALSE, TRUE, NOW(), 'CLIENT'),

        ('!', NULL, FALSE, 'ferran.torres', 'Ferran', 'Torres',
         'ferran.torres@demo-user.eatsok.local', FALSE, TRUE, NOW(), 'CLIENT'),

        ('!', NULL, FALSE, 'zara.larsson', 'Zara', 'Larsson',
         'zara.larsson@demo-user.eatsok.local', FALSE, TRUE, NOW(), 'CLIENT'),

        ('!', NULL, FALSE, 'soobin.choi', 'Soobin', 'Choi',
         'soobin.choi@demo-user.eatsok.local', FALSE, TRUE, NOW(), 'CLIENT'),

        ('!', NULL, FALSE, 'kiriko.kamori', 'Kiriko', 'Kamori',
         'kiriko.kamori@demo-user.eatsok.local', FALSE, TRUE, NOW(), 'CLIENT'),

        ('!', NULL, FALSE, 'hana.song', 'Hana', 'Song',
         'hana.song@demo-user.eatsok.local', FALSE, TRUE, NOW(), 'CLIENT'),

        ('!', NULL, FALSE, 'niran.pruksamanee', 'Niran', 'Pruksamanee',
         'niran.pruksamanee@demo-user.eatsok.local', FALSE, TRUE, NOW(), 'CLIENT');


    -- ----------------------------
    -- TAGS
    -- ----------------------------

    INSERT INTO establishments_tag (name, description)
    VALUES
        ('Española', 'Cocina española y tradicional'),
        ('Mediterránea', 'Cocina de inspiración mediterránea'),
        ('Italiana', 'Pasta, pizza y cocina italiana'),
        ('Asiática', 'Cocina asiática'),
        ('Mexicana', 'Cocina mexicana'),
        ('Vegana', 'Oferta centrada en platos veganos'),
        ('Vegetariana', 'Amplia oferta vegetariana'),
        ('Cafetería', 'Café, desayunos y meriendas'),
        ('Brunch', 'Desayunos tardíos y brunch'),
        ('Fast food', 'Servicio rápido'),
        ('Pastelería', 'Dulces, postres y repostería'),
        ('Saludable', 'Oferta orientada a alimentación equilibrada'),
        ('Sin gluten', 'Oferta con opciones sin gluten'),
        ('Internacional', 'Cocina internacional'),
        ('Tapas', 'Tapas y raciones')
    ON CONFLICT (name) DO NOTHING;

    -- ----------------------------
    -- ESTABLISHMENTS
    -- ----------------------------

    INSERT INTO establishments_establishment
        (owner_id, name, description, phone, email, opening_time, closing_time,
         cross_contamination, restrictions_info, active)
    VALUES
        (v_owner_id, 'Naranja de Sol', 'Cocina mediterránea contemporánea junto a Puerta del Sol.',
         '910000001', 'naranja.sol@demo.eatsok.local', '12:00', '23:30',
         'La cocina utiliza zonas de preparación compartidas.',
         'El personal dispone de información sobre ingredientes y alérgenos.', TRUE),

        (v_owner_id, 'Verde Gran Vía', 'Restaurante urbano con bowls, ensaladas y platos ligeros.',
         '910000002', 'verde.granvia@demo.eatsok.local', '11:30', '23:00',
         'Algunos utensilios pueden compartirse entre elaboraciones.',
         'Se pueden solicitar adaptaciones en varios platos.', TRUE),

        (v_owner_id, 'La Mesa de Callao', 'Cocina española de raciones y platos para compartir.',
         '910000003', 'mesa.callao@demo.eatsok.local', '12:30', '00:00',
         'Freidoras y planchas compartidas.',
         'Consultar al personal antes de realizar el pedido.', TRUE),

        (v_owner_id, 'Brunch Malasaña', 'Cafetería de brunch, tostadas y desayunos.',
         '910000004', 'brunch.malasana@demo.eatsok.local', '08:30', '20:30',
         'La zona de panadería manipula gluten de forma habitual.',
         'Disponibles bebidas vegetales y algunas opciones adaptadas.', TRUE),

        (v_owner_id, 'Chueca Verde', 'Cocina vegetal e internacional en el barrio de Chueca.',
         '910000005', 'chueca.verde@demo.eatsok.local', '12:00', '23:00',
         'La mayor parte de elaboraciones son vegetales, pero existen ingredientes con gluten.',
         'Carta con indicaciones de compatibilidad alimentaria.', TRUE),

        (v_owner_id, 'Lavapiés Fusión', 'Pequeño local de cocina asiática e internacional.',
         '910000006', 'lavapies.fusion@demo.eatsok.local', '13:00', '23:30',
         'Uso habitual de soja, sésamo y frutos secos en cocina.',
         'El personal puede informar de los ingredientes de cada elaboración.', TRUE),

        (v_owner_id, 'La Latina Tapas', 'Tapas y raciones de inspiración tradicional.',
         '910000007', 'latina.tapas@demo.eatsok.local', '12:00', '00:00',
         'Freidora compartida entre distintas elaboraciones.',
         'Se pueden consultar alérgenos antes de pedir.', TRUE),

        (v_owner_id, 'Letras Mediterráneo', 'Restaurante mediterráneo en el Barrio de las Letras.',
         '910000008', 'letras.mediterraneo@demo.eatsok.local', '12:30', '23:30',
         'Superficies de preparación compartidas.',
         'Diversos platos pueden prepararse con pequeñas adaptaciones.', TRUE),

        (v_owner_id, 'Atocha Bowl', 'Bowls personalizables y cocina saludable cerca de Atocha.',
         '910000009', 'atocha.bowl@demo.eatsok.local', '11:00', '22:30',
         'Los ingredientes se almacenan de forma separada, aunque se comparten zonas de montaje.',
         'Los bowls permiten seleccionar ingredientes individualmente.', TRUE),

        (v_owner_id, 'Retiro Natural', 'Restaurante saludable próximo al parque del Retiro.',
         '910000010', 'retiro.natural@demo.eatsok.local', '10:30', '22:30',
         'Se manipulan frutos secos y semillas en cocina.',
         'Oferta amplia de platos vegetarianos y veganos.', TRUE),

        (v_owner_id, 'Ópera Italiana', 'Pasta y cocina italiana en la zona de Ópera.',
         '910000011', 'opera.italiana@demo.eatsok.local', '13:00', '23:30',
         'Harinas con gluten presentes de forma habitual.',
         'Consultar disponibilidad de pasta alternativa.', TRUE),

        (v_owner_id, 'Palacio Café', 'Cafetería de desayunos, meriendas y repostería.',
         '910000012', 'palacio.cafe@demo.eatsok.local', '08:00', '21:00',
         'Zona de repostería compartida.',
         'Disponibles bebidas vegetales.', TRUE),

        (v_owner_id, 'Tribunal Street Food', 'Local informal con platos internacionales.',
         '910000013', 'tribunal.street@demo.eatsok.local', '12:00', '00:00',
         'Cocina compartida para todos los platos.',
         'Información de ingredientes disponible bajo petición.', TRUE),

        (v_owner_id, 'Recoletos Fresh', 'Ensaladas, wraps y cocina ligera.',
         '910000014', 'recoletos.fresh@demo.eatsok.local', '10:00', '22:00',
         'Puede existir contacto cruzado durante el montaje.',
         'Ingredientes personalizables.', TRUE),

        (v_owner_id, 'Cibeles Cocina', 'Cocina española contemporánea cerca de Cibeles.',
         '910000015', 'cibeles.cocina@demo.eatsok.local', '12:30', '23:30',
         'Plancha y freidora compartidas.',
         'El personal dispone de una ficha de alérgenos.', TRUE),

        (v_owner_id, 'Embajadores Veggie', 'Cocina vegetal casual.',
         '910000016', 'embajadores.veggie@demo.eatsok.local', '12:00', '22:30',
         'No se utilizan productos cárnicos, aunque sí ingredientes con gluten y frutos secos.',
         'Toda la carta es vegetariana y gran parte vegana.', TRUE),

        (v_owner_id, 'Antón Martín Café', 'Café de especialidad, tostadas y platos sencillos.',
         '910000017', 'antonmartin.cafe@demo.eatsok.local', '08:00', '20:00',
         'Preparación compartida con productos de bollería.',
         'Leches vegetales disponibles.', TRUE),

        (v_owner_id, 'Huertas Mex', 'Cocina mexicana de tacos, bowls y entrantes.',
         '910000018', 'huertas.mex@demo.eatsok.local', '13:00', '23:30',
         'Uso frecuente de lácteos y posibles trazas de gluten.',
         'Se pueden pedir algunos platos sin queso.', TRUE),

        (v_owner_id, 'Plaza Mayor Tradición', 'Cocina tradicional española.',
         '910000019', 'plazamayor.tradicion@demo.eatsok.local', '12:00', '00:00',
         'Freidoras compartidas.',
         'Consultar opciones adaptables.', TRUE),

        (v_owner_id, 'Santo Domingo Asia', 'Cocina asiática informal.',
         '910000020', 'santodomingo.asia@demo.eatsok.local', '12:00', '23:30',
         'Uso frecuente de soja, sésamo, cacahuete y frutos secos.',
         'Listado de ingredientes disponible.', TRUE),

        (v_owner_id, 'Conde Duque Brunch', 'Brunch y café de especialidad.',
         '910000021', 'condeduque.brunch@demo.eatsok.local', '09:00', '21:00',
         'Manipulación habitual de gluten y huevos.',
         'Opciones vegetarianas y bebidas vegetales.', TRUE),

        (v_owner_id, 'Argüelles Sana', 'Comida saludable y bowls personalizables.',
         '910000022', 'arguelles.sana@demo.eatsok.local', '11:00', '22:00',
         'Montaje en línea compartida.',
         'Posibilidad de retirar ingredientes en la mayoría de platos.', TRUE),

        (v_owner_id, 'Moncloa Mediterránea', 'Restaurante mediterráneo casual.',
         '910000023', 'moncloa.med@demo.eatsok.local', '12:00', '23:00',
         'Cocina general compartida.',
         'Información de alérgenos disponible.', TRUE),

        (v_owner_id, 'Delicias Verde', 'Cocina vegetal, ensaladas y platos del día.',
         '910000024', 'delicias.verde@demo.eatsok.local', '11:30', '22:30',
         'Se utilizan semillas y frutos secos en algunas preparaciones.',
         'Amplia oferta vegana.', TRUE),

        (v_owner_id, 'Menéndez Pelayo Café', 'Cafetería y cocina ligera al este del Retiro.',
         '910000025', 'menendez.cafe@demo.eatsok.local', '08:00', '21:30',
         'Zona de cocina y repostería compartida.',
         'Disponibles alternativas vegetales.', TRUE);

	-- ----------------------------
	-- LOCATIONS
	-- Central Madrid coordinates.
	-- ----------------------------

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle de Carretas, 8', 'Madrid', 'Comunidad de Madrid', 'España', '28012', 40.41655, -3.70370
	FROM establishments_establishment
	WHERE email = 'naranja.sol@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Gran Vía, 32', 'Madrid', 'Comunidad de Madrid', 'España', '28013', 40.42015, -3.70575
	FROM establishments_establishment
	WHERE email = 'verde.granvia@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle de Jacometrezo, 6', 'Madrid', 'Comunidad de Madrid', 'España', '28013', 40.42010, -3.70695
	FROM establishments_establishment
	WHERE email = 'mesa.callao@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle del Espíritu Santo, 18', 'Madrid', 'Comunidad de Madrid', 'España', '28004', 40.42525, -3.70490
	FROM establishments_establishment
	WHERE email = 'brunch.malasana@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle de Augusto Figueroa, 21', 'Madrid', 'Comunidad de Madrid', 'España', '28004', 40.42265, -3.69795
	FROM establishments_establishment
	WHERE email = 'chueca.verde@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle de Argumosa, 14', 'Madrid', 'Comunidad de Madrid', 'España', '28012', 40.40895, -3.69790
	FROM establishments_establishment
	WHERE email = 'lavapies.fusion@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle de la Cava Baja, 27', 'Madrid', 'Comunidad de Madrid', 'España', '28005', 40.41235, -3.70895
	FROM establishments_establishment
	WHERE email = 'latina.tapas@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle de Huertas, 31', 'Madrid', 'Comunidad de Madrid', 'España', '28014', 40.41360, -3.69870
	FROM establishments_establishment
	WHERE email = 'letras.mediterraneo@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Paseo de las Delicias, 8', 'Madrid', 'Comunidad de Madrid', 'España', '28045', 40.40615, -3.69335
	FROM establishments_establishment
	WHERE email = 'atocha.bowl@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle de Ibiza, 18', 'Madrid', 'Comunidad de Madrid', 'España', '28009', 40.41810, -3.67675
	FROM establishments_establishment
	WHERE email = 'retiro.natural@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle de los Caños del Peral, 7', 'Madrid', 'Comunidad de Madrid', 'España', '28013', 40.41825, -3.71010
	FROM establishments_establishment
	WHERE email = 'opera.italiana@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle de Bailén, 15', 'Madrid', 'Comunidad de Madrid', 'España', '28013', 40.41705, -3.71305
	FROM establishments_establishment
	WHERE email = 'palacio.cafe@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle de Fuencarral, 67', 'Madrid', 'Comunidad de Madrid', 'España', '28004', 40.42610, -3.70175
	FROM establishments_establishment
	WHERE email = 'tribunal.street@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle de Recoletos, 11', 'Madrid', 'Comunidad de Madrid', 'España', '28001', 40.42245, -3.69085
	FROM establishments_establishment
	WHERE email = 'recoletos.fresh@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle de Alcalá, 42', 'Madrid', 'Comunidad de Madrid', 'España', '28014', 40.41915, -3.69415
	FROM establishments_establishment
	WHERE email = 'cibeles.cocina@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle de Embajadores, 44', 'Madrid', 'Comunidad de Madrid', 'España', '28012', 40.40945, -3.70230
	FROM establishments_establishment
	WHERE email = 'embajadores.veggie@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle de Santa Isabel, 28', 'Madrid', 'Comunidad de Madrid', 'España', '28012', 40.41055, -3.69640
	FROM establishments_establishment
	WHERE email = 'antonmartin.cafe@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle de León, 17', 'Madrid', 'Comunidad de Madrid', 'España', '28014', 40.41375, -3.69935
	FROM establishments_establishment
	WHERE email = 'huertas.mex@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle de Toledo, 9', 'Madrid', 'Comunidad de Madrid', 'España', '28005', 40.41485, -3.70720
	FROM establishments_establishment
	WHERE email = 'plazamayor.tradicion@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle de San Bernardo, 14', 'Madrid', 'Comunidad de Madrid', 'España', '28015', 40.42165, -3.70805
	FROM establishments_establishment
	WHERE email = 'santodomingo.asia@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle del Conde Duque, 12', 'Madrid', 'Comunidad de Madrid', 'España', '28015', 40.42815, -3.71040
	FROM establishments_establishment
	WHERE email = 'condeduque.brunch@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle de la Princesa, 35', 'Madrid', 'Comunidad de Madrid', 'España', '28008', 40.43045, -3.71550
	FROM establishments_establishment
	WHERE email = 'arguelles.sana@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Calle de Ferraz, 20', 'Madrid', 'Comunidad de Madrid', 'España', '28008', 40.42525, -3.71740
	FROM establishments_establishment
	WHERE email = 'moncloa.med@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Paseo de las Delicias, 72', 'Madrid', 'Comunidad de Madrid', 'España', '28045', 40.39785, -3.69455
	FROM establishments_establishment
	WHERE email = 'delicias.verde@demo.eatsok.local';

	INSERT INTO establishments_location
		(establishment_id, address, city, region, country, postal_code, latitude, longitude)
	SELECT id, 'Avenida de Menéndez Pelayo, 53', 'Madrid', 'Comunidad de Madrid', 'España', '28009', 40.41240, -3.67660
	FROM establishments_establishment
	WHERE email = 'menendez.cafe@demo.eatsok.local';

    -- ----------------------------
    -- TAG LINKS
    -- ----------------------------

    INSERT INTO establishments_establishment_tags (establishment_id, tag_id)
    SELECT e.id, t.id
    FROM establishments_establishment e
    JOIN establishments_tag t ON t.name = ANY (
        CASE e.name
            WHEN 'Naranja de Sol' THEN ARRAY['Mediterránea','Española']
            WHEN 'Verde Gran Vía' THEN ARRAY['Saludable','Vegetariana']
            WHEN 'La Mesa de Callao' THEN ARRAY['Española','Tapas']
            WHEN 'Brunch Malasaña' THEN ARRAY['Cafetería','Brunch']
            WHEN 'Chueca Verde' THEN ARRAY['Vegana','Vegetariana','Internacional']
            WHEN 'Lavapiés Fusión' THEN ARRAY['Asiática','Internacional']
            WHEN 'La Latina Tapas' THEN ARRAY['Española','Tapas']
            WHEN 'Letras Mediterráneo' THEN ARRAY['Mediterránea']
            WHEN 'Atocha Bowl' THEN ARRAY['Saludable','Vegetariana']
            WHEN 'Retiro Natural' THEN ARRAY['Saludable','Vegana','Vegetariana']
            WHEN 'Ópera Italiana' THEN ARRAY['Italiana']
            WHEN 'Palacio Café' THEN ARRAY['Cafetería','Pastelería']
            WHEN 'Tribunal Street Food' THEN ARRAY['Fast food','Internacional']
            WHEN 'Recoletos Fresh' THEN ARRAY['Saludable']
            WHEN 'Cibeles Cocina' THEN ARRAY['Española','Mediterránea']
            WHEN 'Embajadores Veggie' THEN ARRAY['Vegana','Vegetariana']
            WHEN 'Antón Martín Café' THEN ARRAY['Cafetería','Brunch']
            WHEN 'Huertas Mex' THEN ARRAY['Mexicana']
            WHEN 'Plaza Mayor Tradición' THEN ARRAY['Española','Tapas']
            WHEN 'Santo Domingo Asia' THEN ARRAY['Asiática']
            WHEN 'Conde Duque Brunch' THEN ARRAY['Cafetería','Brunch']
            WHEN 'Argüelles Sana' THEN ARRAY['Saludable','Vegetariana']
            WHEN 'Moncloa Mediterránea' THEN ARRAY['Mediterránea']
            WHEN 'Delicias Verde' THEN ARRAY['Vegana','Vegetariana']
            WHEN 'Menéndez Pelayo Café' THEN ARRAY['Cafetería']
            ELSE ARRAY[]::text[]
        END
    )
    WHERE e.email LIKE '%@demo.eatsok.local'
    ON CONFLICT DO NOTHING;

    -- ----------------------------
    -- DISHES
    -- Five dishes per demo establishment.
    --
    -- The demo dataset is intentionally balanced for the profile used in
    -- the presentation: Gluten + Lácteos + Vegetariano.
    --
    -- Target distribution with those three restrictions active:
    --   12 establishments: HIGH compatibility (80-100%)
    --    8 establishments: MEDIUM compatibility (40-60%)
    --    5 establishments: LOW compatibility (0-20%)
    -- ----------------------------

    INSERT INTO establishments_dish
        (establishment_id, name, description, price, available)
    SELECT e.id, d.name, d.description, d.price, TRUE
    FROM establishments_establishment e
    CROSS JOIN LATERAL (
        VALUES
            (
                'Ensalada de temporada',
                'Ensalada fresca con ingredientes de temporada.',
                11.50::numeric
            ),
            (
                'Bowl de verduras',
                'Bowl de verduras, cereal y aliño de la casa.',
                12.90::numeric
            ),
            (
                'Plato principal de la casa',
                'Preparación principal representativa del establecimiento.',
                15.50::numeric
            ),
            (
                'Postre artesanal',
                'Postre elaborado diariamente.',
                6.50::numeric
            ),
            (
                CASE
                    WHEN e.name = 'Ópera Italiana' THEN 'Pizza margarita'
                    WHEN e.name = 'Huertas Mex' THEN 'Tacos vegetales'
                    WHEN e.name IN ('Lavapiés Fusión', 'Santo Domingo Asia') THEN 'Curry vegetal'
                    WHEN e.name IN ('Brunch Malasaña', 'Conde Duque Brunch') THEN 'Tostada de aguacate'
                    WHEN e.name IN ('Chueca Verde', 'Embajadores Veggie', 'Delicias Verde') THEN 'Hamburguesa vegetal'
                    WHEN e.name IN ('Atocha Bowl', 'Argüelles Sana', 'Retiro Natural') THEN 'Bowl especial'
                    ELSE 'Especial de la casa'
                END,
                'Plato destacado del establecimiento.',
                13.90::numeric
            )
    ) AS d(name, description, price)
    WHERE e.email LIKE '%@demo.eatsok.local';


    -- ----------------------------
    -- DISH RESTRICTIONS
    --
    -- IMPORTANT FOR THE DEMO:
    -- `get_compatible_dishes()` currently treats every DishRestriction whose
    -- restriction is active as an incompatibility. The seed therefore also
    -- uses the "Vegetariano" restriction as an incompatibility marker for
    -- non-vegetarian demo dishes.
    --
    -- This makes Gluten, Lácteos and Vegetariano all influence the map
    -- compatibility during the presentation.
    -- ----------------------------

    WITH compatibility_plan(email, incompatible_count, restriction_offset) AS (
        VALUES
            -- HIGH: 100% compatible (5/5)
            ('chueca.verde@demo.eatsok.local', 0, 0),
            ('retiro.natural@demo.eatsok.local', 0, 1),
            ('atocha.bowl@demo.eatsok.local', 0, 2),
            ('embajadores.veggie@demo.eatsok.local', 0, 0),
            ('delicias.verde@demo.eatsok.local', 0, 1),
            ('recoletos.fresh@demo.eatsok.local', 0, 2),

            -- HIGH: 80% compatible (4/5)
            ('verde.granvia@demo.eatsok.local', 1, 0),
            ('naranja.sol@demo.eatsok.local', 1, 1),
            ('letras.mediterraneo@demo.eatsok.local', 1, 2),
            ('arguelles.sana@demo.eatsok.local', 1, 0),
            ('antonmartin.cafe@demo.eatsok.local', 1, 1),
            ('moncloa.med@demo.eatsok.local', 1, 2),

            -- MEDIUM: 60% compatible (3/5)
            ('brunch.malasana@demo.eatsok.local', 2, 0),
            ('lavapies.fusion@demo.eatsok.local', 2, 1),
            ('huertas.mex@demo.eatsok.local', 2, 2),
            ('condeduque.brunch@demo.eatsok.local', 2, 0),

            -- MEDIUM: 40% compatible (2/5)
            ('latina.tapas@demo.eatsok.local', 3, 1),
            ('cibeles.cocina@demo.eatsok.local', 3, 2),
            ('palacio.cafe@demo.eatsok.local', 3, 0),
            ('santodomingo.asia@demo.eatsok.local', 3, 1),

            -- LOW: 20% compatible (1/5)
            ('mesa.callao@demo.eatsok.local', 4, 0),
            ('opera.italiana@demo.eatsok.local', 4, 1),
            ('tribunal.street@demo.eatsok.local', 4, 2),

            -- LOW: 0% compatible (0/5)
            ('plazamayor.tradicion@demo.eatsok.local', 5, 0),
            ('menendez.cafe@demo.eatsok.local', 5, 2)
    ),
    ranked_dishes AS (
        SELECT
            d.id AS dish_id,
            e.email,
            ROW_NUMBER() OVER (
                PARTITION BY e.id
                ORDER BY d.id
            ) AS dish_number
        FROM establishments_dish d
        JOIN establishments_establishment e
            ON e.id = d.establishment_id
        WHERE e.email LIKE '%@demo.eatsok.local'
    ),
    planned_incompatibilities AS (
        SELECT
            rd.dish_id,
            rd.dish_number,
            cp.restriction_offset,
            CASE
                WHEN MOD(rd.dish_number - 1 + cp.restriction_offset, 3) = 0
                    THEN 'Gluten'
                WHEN MOD(rd.dish_number - 1 + cp.restriction_offset, 3) = 1
                    THEN 'Lácteos'
                ELSE 'Vegetariano'
            END AS restriction_name
        FROM ranked_dishes rd
        JOIN compatibility_plan cp
            ON cp.email = rd.email
        WHERE rd.dish_number <= cp.incompatible_count
    )
    INSERT INTO establishments_dishrestriction
        (dish_id, restriction_id, presence_type)
    SELECT
        pi.dish_id,
        r.id,
        CASE
            WHEN pi.restriction_name = 'Vegetariano' THEN 'contains'
            WHEN MOD(pi.dish_number, 3) = 0 THEN 'traces'
            WHEN MOD(pi.dish_number, 2) = 0 THEN 'may_contain'
            ELSE 'contains'
        END
    FROM planned_incompatibilities pi
    JOIN food_profiles_restriction r
        ON r.name = pi.restriction_name
    ON CONFLICT DO NOTHING;


    -- Additional restrictions unrelated to the presentation profile.
    -- These provide more realistic data when testing other filters.
    INSERT INTO establishments_dishrestriction
        (dish_id, restriction_id, presence_type)
    SELECT d.id, r.id, 'traces'
    FROM establishments_dish d
    JOIN establishments_establishment e
        ON e.id = d.establishment_id
    JOIN food_profiles_restriction r
        ON r.name = 'Frutos de cáscara'
    WHERE e.email LIKE '%@demo.eatsok.local'
      AND d.name = 'Postre artesanal'
      AND MOD(e.id, 4) = 0
    ON CONFLICT DO NOTHING;

    INSERT INTO establishments_dishrestriction
        (dish_id, restriction_id, presence_type)
    SELECT d.id, r.id, 'may_contain'
    FROM establishments_dish d
    JOIN establishments_establishment e
        ON e.id = d.establishment_id
    JOIN food_profiles_restriction r
        ON r.name IN ('Soja', 'Semillas de sésamo')
    WHERE e.email LIKE '%@demo.eatsok.local'
      AND d.name = 'Bowl de verduras'
      AND MOD(e.id, 5) = 0
    ON CONFLICT DO NOTHING;


    -- ----------------------------
    -- RECIPES
    -- 30 fictional recipes, some attached to establishments.
    -- ----------------------------

    INSERT INTO recipes_recipe
        (author_id, establishment_id, title, description, ingredients, steps,
         preparation_time, publication_date, visible)
    VALUES
        (v_owner_id, NULL, '[DEMO] Tortitas de avena y plátano',
         'Desayuno sencillo y rápido.',
         '1 plátano\n80 g de avena\n2 huevos\nCanela',
         'Triturar los ingredientes.\nCalentar una sartén.\nCocinar por ambos lados.',
         15, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Crema de calabaza',
         'Crema vegetal suave.',
         'Calabaza\nPatata\nCebolla\nAceite de oliva\nSal',
         'Trocear.\nCocer hasta ablandar.\nTriturar y ajustar de sal.',
         35, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Ensalada mediterránea',
         'Ensalada fresca para cualquier época del año.',
         'Tomate\nPepino\nAceitunas\nCebolla\nAceite de oliva',
         'Lavar y cortar.\nMezclar.\nAliñar antes de servir.',
         10, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Curry vegetal con arroz',
         'Curry suave de verduras.',
         'Arroz\nCalabacín\nZanahoria\nLeche de coco\nCurry',
         'Cocer el arroz.\nSaltear las verduras.\nAñadir leche de coco y curry.',
         35, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Pasta con tomate asado',
         'Pasta sencilla con salsa casera.',
         'Pasta\nTomate\nAjo\nAceite de oliva\nAlbahaca',
         'Asar los tomates.\nCocer la pasta.\nTriturar la salsa y mezclar.',
         30, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Hummus clásico',
         'Crema de garbanzos para aperitivo.',
         'Garbanzos\nTahini\nLimón\nAjo\nAceite de oliva',
         'Triturar todos los ingredientes hasta obtener una crema.',
         10, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Arroz con verduras',
         'Arroz casero con verduras variadas.',
         'Arroz\nPimiento\nCalabacín\nGuisantes\nCaldo vegetal',
         'Sofreír las verduras.\nAñadir el arroz.\nIncorporar caldo y cocinar.',
         40, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Gazpacho',
         'Sopa fría de tomate.',
         'Tomate\nPepino\nPimiento\nAceite de oliva\nVinagre',
         'Triturar.\nColar si se desea.\nEnfriar antes de servir.',
         15, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Patatas al horno',
         'Guarnición sencilla y crujiente.',
         'Patatas\nAceite de oliva\nRomero\nSal',
         'Cortar las patatas.\nAliñar.\nHornear hasta dorar.',
         45, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Tacos de verduras',
         'Tacos vegetales de preparación rápida.',
         'Tortillas de maíz\nPimiento\nCebolla\nAguacate\nLima',
         'Saltear las verduras.\nCalentar las tortillas.\nMontar los tacos.',
         25, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Bowl de quinoa',
         'Bowl completo con quinoa y verduras.',
         'Quinoa\nTomate\nEspinacas\nPepino\nAguacate',
         'Cocer la quinoa.\nPreparar las verduras.\nMontar el bowl.',
         25, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Sopa de lentejas',
         'Sopa nutritiva de legumbres.',
         'Lentejas\nZanahoria\nCebolla\nTomate\nCaldo',
         'Sofreír verduras.\nAñadir lentejas y caldo.\nCocer hasta que estén tiernas.',
         50, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Pisto de verduras',
         'Receta tradicional de verduras.',
         'Tomate\nCalabacín\nPimiento\nCebolla\nAceite',
         'Trocear.\nCocinar lentamente.\nRectificar de sal.',
         40, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Mousse de chocolate',
         'Postre cremoso de chocolate.',
         'Chocolate\nHuevos\nAzúcar',
         'Fundir el chocolate.\nIncorporar huevos.\nEnfriar varias horas.',
         25, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Tortilla de patata',
         'Versión clásica de tortilla.',
         'Patata\nHuevos\nCebolla\nAceite',
         'Pochar patata y cebolla.\nMezclar con huevo.\nCuajar por ambos lados.',
         40, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Guacamole',
         'Acompañamiento fresco de aguacate.',
         'Aguacate\nTomate\nCebolla\nLima\nCilantro',
         'Machacar el aguacate.\nAñadir el resto.\nMezclar.',
         10, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Risotto de setas',
         'Arroz cremoso con setas.',
         'Arroz\nSetas\nCaldo\nCebolla\nQueso',
         'Sofreír cebolla y setas.\nAñadir arroz.\nIncorporar caldo poco a poco.',
         40, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Ensalada de garbanzos',
         'Ensalada completa de legumbres.',
         'Garbanzos\nTomate\nPepino\nCebolla\nPerejil',
         'Escurrir los garbanzos.\nCortar verduras.\nMezclar y aliñar.',
         15, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Boniato asado',
         'Boniato especiado al horno.',
         'Boniato\nAceite\nPimentón\nSal',
         'Cortar.\nAliñar.\nHornear hasta que esté tierno.',
         40, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Smoothie tropical',
         'Batido de frutas tropicales.',
         'Mango\nPiña\nPlátano\nBebida vegetal',
         'Triturar todos los ingredientes y servir frío.',
         5, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Berenjenas rellenas',
         'Berenjenas al horno con verduras.',
         'Berenjena\nTomate\nCebolla\nPimiento',
         'Asar la berenjena.\nPreparar el relleno.\nRellenar y gratinar.',
         50, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Tabulé de quinoa',
         'Versión de tabulé elaborada con quinoa.',
         'Quinoa\nTomate\nPepino\nPerejil\nLimón',
         'Cocer quinoa.\nPicar verduras.\nMezclar y enfriar.',
         25, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Porridge de manzana',
         'Desayuno caliente de avena.',
         'Avena\nBebida vegetal\nManzana\nCanela',
         'Cocer avena y bebida vegetal.\nAñadir manzana y canela.',
         12, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Falafel al horno',
         'Falafel ligero preparado al horno.',
         'Garbanzos\nCebolla\nPerejil\nComino',
         'Triturar.\nFormar bolas.\nHornear hasta dorar.',
         35, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Ensalada de arroz',
         'Ensalada fría de arroz y verduras.',
         'Arroz\nTomate\nMaíz\nPepino\nAceitunas',
         'Cocer arroz.\nEnfriar.\nMezclar con verduras.',
         25, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Salteado de tofu',
         'Tofu con verduras salteadas.',
         'Tofu\nPimiento\nBrócoli\nSalsa de soja',
         'Dorar tofu.\nAñadir verduras.\nTerminar con salsa.',
         25, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Croquetas vegetales',
         'Croquetas de verduras.',
         'Verduras\nHarina\nBebida vegetal\nPan rallado',
         'Preparar masa.\nEnfriar.\nFormar y cocinar.',
         60, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Bizcocho de limón',
         'Bizcocho casero aromático.',
         'Harina\nHuevos\nAzúcar\nLimón\nAceite',
         'Mezclar ingredientes.\nVerter en molde.\nHornear.',
         50, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Sopa de tomate',
         'Sopa sencilla de tomate y hierbas.',
         'Tomate\nCebolla\nAjo\nCaldo\nAlbahaca',
         'Sofreír.\nAñadir tomate y caldo.\nCocer y triturar.',
         35, NOW(), TRUE),

        (v_owner_id, NULL, '[DEMO] Paté de berenjena',
         'Crema de berenjena asada.',
         'Berenjena\nLimón\nAjo\nTahini',
         'Asar berenjena.\nExtraer pulpa.\nTriturar con el resto.',
         40, NOW(), TRUE);


    -- ----------------------------
    -- RECIPE AUTHORS
    -- ----------------------------
    -- Reassign the original demo recipes across the demo CLIENT accounts so
    -- recipe cards/reviews show varied authors instead of a single owner.

    WITH demo_users AS (
        SELECT
            id,
            ROW_NUMBER() OVER (ORDER BY id) AS rn
        FROM users_user
        WHERE email LIKE '%@demo-user.eatsok.local'
    ),
    user_count AS (
        SELECT COUNT(*)::bigint AS count
        FROM demo_users
    ),
    demo_recipes AS (
        SELECT
            id,
            ROW_NUMBER() OVER (ORDER BY id) AS rn
        FROM recipes_recipe
        WHERE title LIKE '[DEMO]%'
    ),
    assignments AS (
        SELECT
            dr.id AS recipe_id,
            du.id AS user_id
        FROM demo_recipes dr
        CROSS JOIN user_count uc
        JOIN demo_users du
            ON du.rn = MOD(dr.rn - 1, uc.count) + 1
    )
    UPDATE recipes_recipe r
    SET author_id = a.user_id
    FROM assignments a
    WHERE r.id = a.recipe_id;


    -- ----------------------------
    -- FEATURED RECIPES
    -- ----------------------------

    INSERT INTO recipes_recipe (
        author_id,
        establishment_id,
        title,
        description,
        ingredients,
        steps,
        preparation_time,
        publication_date,
        visible
    )
    SELECT
        u.id,
        NULL,
        data.title,
        data.description,
        data.ingredients,
        data.steps,
        data.preparation_time,
        NOW() - data.days_ago * INTERVAL '1 day',
        TRUE
    FROM (
        VALUES
            (
                'pau.cubarsi@demo-user.eatsok.local',
                '[DEMO] Crema catalana',
                'Postre tradicional catalán con crema suave y azúcar caramelizado.',
                '500 ml de leche\n4 yemas de huevo\n80 g de azúcar\n20 g de maicena\nPiel de limón\nCanela',
                'Infusionar la leche con limón y canela.\nMezclar yemas, azúcar y maicena.\nIncorporar la leche y cocinar hasta espesar.\nEnfriar y caramelizar azúcar antes de servir.',
                35,
                2
            ),
            (
                'ferran.torres@demo-user.eatsok.local',
                '[DEMO] Paella valenciana',
                'Paella tradicional con arroz, verduras y carne.',
                'Arroz\nPollo\nConejo\nJudía verde\nGarrofón\nTomate\nAzafrán\nCaldo',
                'Dorar la carne.\nAñadir verduras y tomate.\nIncorporar caldo y azafrán.\nAñadir el arroz y cocinar sin remover hasta que esté en su punto.',
                55,
                4
            ),
            (
                'zara.larsson@demo-user.eatsok.local',
                '[DEMO] Kanelbullar sin lactosa',
                'Rollos de canela de inspiración sueca preparados sin lactosa.',
                'Harina\nBebida vegetal\nMargarina vegetal\nCanela\nAzúcar\nCardamomo',
                'Preparar y dejar levar la masa.\nExtender y rellenar con canela.\nEnrollar, cortar y hornear hasta dorar.',
                70,
                6
            ),
            (
                'soobin.choi@demo-user.eatsok.local',
                '[DEMO] Tteokbokki vegetal',
                'Pasteles de arroz coreanos con salsa picante y verduras.',
                'Tteok\nGochujang\nCebolleta\nZanahoria\nCaldo vegetal\nSésamo',
                'Preparar la salsa.\nAñadir los pasteles de arroz y las verduras.\nCocinar hasta que la salsa espese.',
                25,
                8
            ),
            (
                'kiriko.kamori@demo-user.eatsok.local',
                '[DEMO] Onigiri de verduras',
                'Bolas de arroz japonesas con relleno vegetal.',
                'Arroz japonés\nZanahoria\nEspinacas\nAlga nori\nSésamo',
                'Cocer el arroz.\nPreparar el relleno.\nFormar los onigiri y envolver parcialmente con nori.',
                30,
                10
            ),
            (
                'hana.song@demo-user.eatsok.local',
                '[DEMO] Bibimbap vegetal',
                'Bol de arroz coreano con verduras salteadas.',
                'Arroz\nEspinacas\nZanahoria\nCalabacín\nSetas\nGochujang',
                'Cocer el arroz.\nSaltear cada verdura por separado.\nMontar el bol y servir con salsa.',
                35,
                12
            )
    ) AS data(
        author_email,
        title,
        description,
        ingredients,
        steps,
        preparation_time,
        days_ago
    )
    JOIN users_user u
        ON u.email = data.author_email;


    -- Attach selected recipes to demo establishments owned by the same user.
    UPDATE recipes_recipe r
    SET establishment_id = e.id
    FROM establishments_establishment e
    WHERE
        (r.title = '[DEMO] Curry vegetal con arroz'
            AND e.email = 'lavapies.fusion@demo.eatsok.local')
        OR
        (r.title = '[DEMO] Tacos de verduras'
            AND e.email = 'huertas.mex@demo.eatsok.local')
        OR
        (r.title = '[DEMO] Bowl de quinoa'
            AND e.email = 'atocha.bowl@demo.eatsok.local')
        OR
        (r.title = '[DEMO] Smoothie tropical'
            AND e.email = 'brunch.malasana@demo.eatsok.local')
        OR
        (r.title = '[DEMO] Salteado de tofu'
            AND e.email = 'chueca.verde@demo.eatsok.local');

    -- ----------------------------
    -- RECIPE COMPATIBILITIES
    -- RecipeRestriction means "compatible with".
    -- ----------------------------

    -- A broad set of vegetable recipes compatible with Vegan/Vegetarian.
    INSERT INTO recipes_reciperestriction (recipe_id, restriction_id)
    SELECT rcp.id, rst.id
    FROM recipes_recipe rcp
    JOIN food_profiles_restriction rst
      ON rst.name IN ('Vegano', 'Vegetariano')
    WHERE rcp.title IN (
        '[DEMO] Crema de calabaza',
        '[DEMO] Ensalada mediterránea',
        '[DEMO] Curry vegetal con arroz',
        '[DEMO] Hummus clásico',
        '[DEMO] Arroz con verduras',
        '[DEMO] Gazpacho',
        '[DEMO] Patatas al horno',
        '[DEMO] Tacos de verduras',
        '[DEMO] Bowl de quinoa',
        '[DEMO] Sopa de lentejas',
        '[DEMO] Pisto de verduras',
        '[DEMO] Guacamole',
        '[DEMO] Ensalada de garbanzos',
        '[DEMO] Boniato asado',
        '[DEMO] Smoothie tropical',
        '[DEMO] Berenjenas rellenas',
        '[DEMO] Tabulé de quinoa',
        '[DEMO] Falafel al horno',
        '[DEMO] Ensalada de arroz',
        '[DEMO] Sopa de tomate'
    )
    ON CONFLICT DO NOTHING;

    -- Recipes naturally written without gluten in this demo dataset.
    INSERT INTO recipes_reciperestriction (recipe_id, restriction_id)
    SELECT rcp.id, rst.id
    FROM recipes_recipe rcp
    JOIN food_profiles_restriction rst ON rst.name = 'Gluten'
    WHERE rcp.title IN (
        '[DEMO] Crema de calabaza',
        '[DEMO] Ensalada mediterránea',
        '[DEMO] Arroz con verduras',
        '[DEMO] Gazpacho',
        '[DEMO] Patatas al horno',
        '[DEMO] Tacos de verduras',
        '[DEMO] Bowl de quinoa',
        '[DEMO] Sopa de lentejas',
        '[DEMO] Pisto de verduras',
        '[DEMO] Tortilla de patata',
        '[DEMO] Guacamole',
        '[DEMO] Ensalada de garbanzos',
        '[DEMO] Boniato asado',
        '[DEMO] Smoothie tropical',
        '[DEMO] Berenjenas rellenas',
        '[DEMO] Tabulé de quinoa',
        '[DEMO] Ensalada de arroz',
        '[DEMO] Sopa de tomate'
    )
    ON CONFLICT DO NOTHING;

    -- Dairy compatible demo recipes.
    INSERT INTO recipes_reciperestriction (recipe_id, restriction_id)
    SELECT rcp.id, rst.id
    FROM recipes_recipe rcp
    JOIN food_profiles_restriction rst ON rst.name = 'Lácteos'
    WHERE rcp.title IN (
        '[DEMO] Crema de calabaza',
        '[DEMO] Ensalada mediterránea',
        '[DEMO] Curry vegetal con arroz',
        '[DEMO] Hummus clásico',
        '[DEMO] Arroz con verduras',
        '[DEMO] Gazpacho',
        '[DEMO] Patatas al horno',
        '[DEMO] Tacos de verduras',
        '[DEMO] Bowl de quinoa',
        '[DEMO] Sopa de lentejas',
        '[DEMO] Pisto de verduras',
        '[DEMO] Guacamole',
        '[DEMO] Ensalada de garbanzos',
        '[DEMO] Boniato asado',
        '[DEMO] Smoothie tropical',
        '[DEMO] Berenjenas rellenas',
        '[DEMO] Tabulé de quinoa',
        '[DEMO] Falafel al horno',
        '[DEMO] Ensalada de arroz',
        '[DEMO] Sopa de tomate'
    )
    ON CONFLICT DO NOTHING;


    -- ----------------------------
    -- FEATURED RECIPE COMPATIBILITIES
    -- ----------------------------

    INSERT INTO recipes_reciperestriction (recipe_id, restriction_id)
    SELECT rcp.id, rst.id
    FROM recipes_recipe rcp
    JOIN food_profiles_restriction rst
      ON (
            rcp.title = '[DEMO] Crema catalana'
            AND rst.name IN ('Gluten', 'Vegetariano')
         )
         OR (
            rcp.title = '[DEMO] Paella valenciana'
            AND rst.name IN ('Gluten', 'Lácteos')
         )
         OR (
            rcp.title = '[DEMO] Kanelbullar sin lactosa'
            AND rst.name IN ('Lácteos', 'Vegetariano')
         )
         OR (
            rcp.title = '[DEMO] Tteokbokki vegetal'
            AND rst.name IN ('Lácteos', 'Vegetariano', 'Vegano')
         )
         OR (
            rcp.title = '[DEMO] Onigiri de verduras'
            AND rst.name IN ('Gluten', 'Lácteos', 'Vegetariano', 'Vegano')
         )
         OR (
            rcp.title = '[DEMO] Bibimbap vegetal'
            AND rst.name IN ('Lácteos', 'Vegetariano', 'Vegano')
         )
    WHERE rcp.title IN (
        '[DEMO] Crema catalana',
        '[DEMO] Paella valenciana',
        '[DEMO] Kanelbullar sin lactosa',
        '[DEMO] Tteokbokki vegetal',
        '[DEMO] Onigiri de verduras',
        '[DEMO] Bibimbap vegetal'
    )
    ON CONFLICT DO NOTHING;


    -- ----------------------------
    -- ESTABLISHMENT REVIEWS
    -- Three short reviews per demo establishment.
    -- ----------------------------

    WITH demo_users AS (
        SELECT
            id,
            ROW_NUMBER() OVER (ORDER BY id) AS rn
        FROM users_user
        WHERE email LIKE '%@demo-user.eatsok.local'
    ),
    user_count AS (
        SELECT COUNT(*)::bigint AS count
        FROM demo_users
    ),
    demo_establishments AS (
        SELECT
            id,
            ROW_NUMBER() OVER (ORDER BY id) AS rn
        FROM establishments_establishment
        WHERE email LIKE '%@demo.eatsok.local'
    ),
    reviewer_slots AS (
        SELECT
            e.id AS establishment_id,
            e.rn AS establishment_rn,
            slot.offset_value,
            MOD(e.rn + slot.offset_value - 2, uc.count) + 1 AS reviewer_rn
        FROM demo_establishments e
        CROSS JOIN user_count uc
        CROSS JOIN (
            VALUES (1), (6), (11)
        ) AS slot(offset_value)
    )
    INSERT INTO reviews_review (
        author_id,
        establishment_id,
        recipe_id,
        rating,
        comment,
        publication_date,
        visible
    )
    SELECT
        u.id,
        rs.establishment_id,
        NULL,
        CASE MOD(rs.establishment_rn + rs.offset_value, 8)
            WHEN 0 THEN 5
            WHEN 1 THEN 4
            WHEN 2 THEN 5
            WHEN 3 THEN 3
            WHEN 4 THEN 4
            WHEN 5 THEN 5
            WHEN 6 THEN 4
            ELSE 2
        END,
        CASE MOD(rs.establishment_rn + rs.offset_value, 8)
            WHEN 0 THEN 'Muy buena atención con los alérgenos.'
            WHEN 1 THEN 'Opciones variadas y bien señalizadas.'
            WHEN 2 THEN 'Todo muy rico, volvería.'
            WHEN 3 THEN 'Me explicaron bien los ingredientes.'
            WHEN 4 THEN 'Buena experiencia en general.'
            WHEN 5 THEN 'El personal fue muy atento.'
            WHEN 6 THEN 'Servicio rápido y agradable.'
            ELSE 'La carta podría indicar mejor las trazas.'
        END,
        NOW() - (
            MOD(rs.establishment_rn * 3 + rs.offset_value, 35)
            * INTERVAL '1 day'
        ),
        TRUE
    FROM reviewer_slots rs
    JOIN demo_users u
        ON u.rn = rs.reviewer_rn;


    -- ----------------------------
    -- RECIPE REVIEWS
    -- Two short reviews per demo recipe.
    -- ----------------------------

    WITH demo_users AS (
        SELECT
            id,
            ROW_NUMBER() OVER (ORDER BY id) AS rn
        FROM users_user
        WHERE email LIKE '%@demo-user.eatsok.local'
    ),
    user_count AS (
        SELECT COUNT(*)::bigint AS count
        FROM demo_users
    ),
    demo_recipes AS (
        SELECT
            id,
            ROW_NUMBER() OVER (ORDER BY id) AS rn
        FROM recipes_recipe
        WHERE title LIKE '[DEMO]%'
    ),
    reviewer_slots AS (
        SELECT
            r.id AS recipe_id,
            r.rn AS recipe_rn,
            slot.offset_value,
            MOD(r.rn + slot.offset_value - 2, uc.count) + 1 AS reviewer_rn
        FROM demo_recipes r
        CROSS JOIN user_count uc
        CROSS JOIN (
            VALUES (3), (9)
        ) AS slot(offset_value)
    )
    INSERT INTO reviews_review (
        author_id,
        establishment_id,
        recipe_id,
        rating,
        comment,
        publication_date,
        visible
    )
    SELECT
        u.id,
        NULL,
        rs.recipe_id,
        CASE MOD(rs.recipe_rn + rs.offset_value, 6)
            WHEN 0 THEN 5
            WHEN 1 THEN 4
            WHEN 2 THEN 5
            WHEN 3 THEN 4
            WHEN 4 THEN 3
            ELSE 5
        END,
        CASE MOD(rs.recipe_rn + rs.offset_value, 6)
            WHEN 0 THEN 'Fácil de seguir y quedó genial.'
            WHEN 1 THEN 'La repetiré seguro.'
            WHEN 2 THEN 'Muy clara y rápida.'
            WHEN 3 THEN 'Buena receta para diario.'
            WHEN 4 THEN 'Cambiaría un poco las cantidades.'
            ELSE 'Me gustó mucho el resultado.'
        END,
        NOW() - (
            MOD(rs.recipe_rn * 2 + rs.offset_value, 28)
            * INTERVAL '1 day'
        ),
        TRUE
    FROM reviewer_slots rs
    JOIN demo_users u
        ON u.rn = rs.reviewer_rn;


END $$;

COMMIT;

-- Quick checks:
-- SELECT COUNT(*) FROM establishments_establishment WHERE email LIKE '%@demo.eatsok.local';
-- SELECT COUNT(*) FROM establishments_dish d
-- JOIN establishments_establishment e ON e.id = d.establishment_id
-- WHERE e.email LIKE '%@demo.eatsok.local';
-- SELECT COUNT(*) FROM recipes_recipe WHERE title LIKE '[DEMO] %';
-- SELECT COUNT(*) FROM users_user WHERE email LIKE '%@demo-user.eatsok.local';
-- SELECT COUNT(*) FROM reviews_review WHERE author_id IN (
--     SELECT id FROM users_user WHERE email LIKE '%@demo-user.eatsok.local'
-- );
