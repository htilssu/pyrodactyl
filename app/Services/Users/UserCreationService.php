<?php

namespace Pterodactyl\Services\Users;

use Ramsey\Uuid\Uuid;
use Pterodactyl\Models\User;
use Illuminate\Contracts\Hashing\Hasher;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Contracts\Auth\PasswordBroker;
use Pterodactyl\Notifications\AccountCreated;
use Pterodactyl\Contracts\Repository\UserRepositoryInterface;

class UserCreationService
{
    /**
     * UserCreationService constructor.
     */
    public function __construct(
        private ConnectionInterface     $connection,
        private PasswordBroker          $passwordBroker,
        private UserRepositoryInterface $repository,
    ) {
    }

    /**
     * Create a new user on the system.
     *
     * @throws \Exception
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     */
    public function handle(array $data): User
    {
        if (array_key_exists('password', $data) && !empty($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }

        $this->connection->beginTransaction();
        if (empty($data['password'])) {
            $generateResetToken = true;
            $data['password'] = password_hash("Password", PASSWORD_BCRYPT);
        }

        /** @var User $user */
        $user = $this->repository->create(array_merge($data, [
            'uuid' => Uuid::uuid4()->toString(),
        ]), true, true);

        if (isset($generateResetToken)) {
            $token = $this->passwordBroker->createToken($user);
        }

        $this->connection->commit();
        $user->notify(new AccountCreated($user, $token ?? null));

        return $user;
    }
}
