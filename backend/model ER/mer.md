### **User**:

La tabla **`User`** almacena los datos básicos del usuario, como **`username`** y **`password`**. La clave primaria de esta tabla es **`id`** (que representa al usuario).

* **Campos**:

  * `id` (PK)
  * `username`
  * `password`

### **Account**:

La tabla **`Account`** está asociada con la tabla **`User`**, estableciendo una relación **uno a uno** a través de la clave foránea **`userId`**. Esta tabla almacena detalles adicionales sobre la cuenta del usuario, como el **`fullName`**, **`email`**, **`role`**, **`balance`** y **`registeredAt`**.

* **Campos**:

  * `id` (PK)
  * `fullName`
  * `email`
  * `role`
  * `balance`
  * `registeredAt`
  * `userId` (FK a `User`)

### **Conversation**:

La tabla **`Conversation`** es una **entidad débil** de **`User`**, ya que depende de un **`User`** para existir. Cada conversación está asociada con un único usuario a través de la clave foránea **`userId`**. Además, la tabla **`Conversation`** tiene campos como **`title`**, **`startedAt`** y **`endedAt`** para almacenar detalles sobre cada conversación.

* **Campos**:

  * `id` (PK)
  * `title`
  * `startedAt`
  * `endedAt`
  * `userId` (FK a `User`)

### **Message**:

La tabla **`Message`** es una **entidad débil** de **`Conversation`**, ya que cada mensaje depende de una conversación. La clave foránea **`conversationId`** hace referencia a la tabla **`Conversation`**, y **`modelId`** hace referencia al modelo utilizado para procesar el mensaje. La tabla **`Message`** también contiene información como **`content`**, **`isFrom`** (para saber si el mensaje es del usuario o del modelo) y **`timestamp`**.

* **Campos**:

  * `id` (PK)
  * `content`
  * `isFrom`
  * `timestamp`
  * `conversationId` (FK a `Conversation`)
  * `modelId` (FK a `Model`)

### **Model**:

La tabla **`Model`** almacena los detalles de los modelos utilizados (por ejemplo, GPT-4, Claude). Cada modelo tiene un **`name`**, **`priceInput`**, **`priceOutput`**, **`provider`** y una breve **`description`**. **`priceInput`** y **`priceOutput`** son importantes para calcular el costo de las consultas realizadas con ese modelo.

* **Campos**:

  * `id` (PK)
  * `name`
  * `priceInput`
  * `priceOutput`
  * `provider`
  * `description`

### **Transaction** (Teórico):

La tabla **`Transaction`** es teórica (no Transaction.java) y se utilizaría para registrar cada transacción (ya sea una recarga de saldo o el pago por una consulta). Esta tabla sirve como entidad principal para las tablas hijas **`Usage`** y **`Recharge`**, las cuales contienen transacciones de uso y recarga respectivamente.

* **Campos** (Teóricos):

  * `id` (PK)
  * `amount`
  * `timestamp`

### **Usage**:

La tabla **`Usage`** registra cuántos **tokens** se han utilizado en cada mensaje. Está asociada a **`Message`** (a través de `messageId`) para saber cuántos tokens se consumieron y qué modelo se utilizó en ese mensaje.

* **Campos**:

  * `id` (PK)
  * `tokens` (cantidad de tokens utilizados)
  * `messageId` (FK a `Message`)
  * `userId` (FK a `User`)

### **Recharge**:

La tabla **`Recharge`** registra las recargas de saldo realizadas por los usuarios. Cada recarga está asociada con un **`userId`**, lo que indica qué usuario realizó la recarga. Además, almacena el **`amount`** de la recarga y el **`timestamp`**.

* **Campos**:

  * `id` (PK)
  * `amount` (monto recargado)
  * `timestamp` (fecha y hora de la recarga)
  * `userId` (FK a `User`)

### **Relaciones entre las tablas**:

1. **`User` → `Account`**:

   * Relación uno a uno. Un **usuario** tiene una única **cuenta**.

2. **`User` → `Conversation`**:

   * Relación uno a muchos. Un **usuario** puede tener muchas **conversaciones**, pero cada **conversación** está asociada a un único **usuario**.

3. **`Conversation` → `Message`**:

   * Relación uno a muchos. Una **conversación** puede tener muchos **mensajes**, pero cada **mensaje** pertenece a una sola **conversación**.

4. **`Message` → `Model`**:

   * Relación muchos a uno. Un **mensaje** se asocia con un solo **modelo** (ya que solo se utiliza un modelo para procesar un mensaje).

5. **`Transaction` → `Usage`** y **`Transaction` → `Recharge`**:

   * Relación de herencia. Una **transacción** puede hereda detalles tanto de **uso** (consultas a modelos) como a **recarga** (a través de las tablas hijas **`Usage`** y **`Recharge`**).

6. **`Usage` → `Message`**:

   * Relación muchos a uno. Cada **uso** de **tokens** está asociado con un **mensaje** específico.

7. **`Recharge` → `User`**:

   * Relación muchos a uno. Cada **recarga** está asociada a un **usuario**.
