import InputError from '@/Components/InputError';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Transition } from '@headlessui/react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const { user } = usePage().props.auth;
    const [errorAvatar, setErrorAvatar] = useState('');

    const { data, setData, put, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        _method: 'PUT',
    });

    const onHandleChange = (e) => setData(e.target.name, e.target.value);

    const onHandleSubmit = (e) => {
        e.preventDefault();

        put(route('profile.update', [user]));
    };

    const onHandleChangeAvatar = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        router.post(
            route('profile.avatar', user.id),
            {
                _method: 'PUT',
                avatar: file,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: (success) => {
                    setErrorAvatar('');
                },
                onError: (errors) => {
                    setErrorAvatar(errors.avatar);
                },
            },
        );
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>

                <CardDescription>Update your account's profile information and email address.</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-x-14 lg:flex-row lg:items-center">
                <form onSubmit={onHandleSubmit} className="mt-6 flex-1 space-y-6">
                    <div>
                        <Label htmlFor="name">Nama</Label>

                        <Input id="name" value={data.name} onChange={onHandleChange} autoComplete="name" name="name" />

                        {errors.name && <InputError className="mt-2" message={errors.name} />}
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>

                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={onHandleChange}
                            autoComplete="username"
                        />

                        {errors.email && <InputError className="mt-2" message={errors.email} />}
                    </div>

                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div>
                            <p className="mt-2 text-sm text-foreground">
                                Your email address is unverified.
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="rounded-md text-sm text-muted-foreground underline hover:text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Click here to re-send the verification email.
                                </Link>
                            </p>

                            {status === 'verification-link-sent' && (
                                <Alert variant="success">
                                    <AlertDescription>
                                        A new verification link has been sent to your email address.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <Button variant="blue" size="lg" disabled={processing}>
                            Save
                        </Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-muted-foreground">Saved.</p>
                        </Transition>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
