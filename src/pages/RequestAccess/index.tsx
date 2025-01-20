import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

// Validation schema
const requestSchema = z.object({
    fullName: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters')
        .regex(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces'),

    email: z.string()
        .email('Please enter a valid email address')
        .min(5, 'Email must be at least 5 characters')
        .max(100, 'Email must be less than 100 characters'),

    phone: z.string()
        .min(10, 'Phone number must be at least 10 characters')
        .max(15, 'Phone number must be less than 15 characters')
        .regex(
            /^\+?[0-9\s\-\(\)]+$/,
            'Please enter a valid phone number'
        ),

    description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description must be less than 500 characters')
});

type RequestFormData = z.infer<typeof requestSchema>;

const RequestAccessPage: React.FC = () => {
    const { toast } = useToast();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<RequestFormData>({
        resolver: zodResolver(requestSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            description: ''
        }
    });

    const onSubmit = async () => {
        try {
            // Here you would typically make an API call to handle the request
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API call

            toast({
                title: "Request Submitted Successfully",
                description: "We'll review your request and get back to you soon.",
                duration: 5000,
            });

            reset();
        } catch {
            toast({
                title: "Error Submitting Request",
                description: "Please try again later.",
                variant: "destructive",
                duration: 5000,
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Request Access
                    </h1>
                    <p className="text-lg text-gray-400">
                        Fill out the form below and we'll get back to you shortly.
                    </p>
                </div>

                {/* Form Card */}
                <Card className="bg-gray-800 border-gray-700 p-6 md:p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-white">
                                Full Name
                            </Label>
                            <div className="relative">
                                <Input
                                    id="fullName"
                                    {...register('fullName')}
                                    className={`bg-gray-700 border-gray-600 text-white 
                    ${errors.fullName ? 'border-red-500 focus:border-red-500' : ''}`}
                                    placeholder="John Doe"
                                />
                            </div>
                            {errors.fullName && (
                                <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    className={`bg-gray-700 border-gray-600 text-white
                    ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                                    placeholder="john@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-white">
                                Phone Number
                            </Label>
                            <div className="relative">
                                <Input
                                    id="phone"
                                    {...register('phone')}
                                    className={`bg-gray-700 border-gray-600 text-white
                    ${errors.phone ? 'border-red-500 focus:border-red-500' : ''}`}
                                    placeholder="+27 123 456 7890"
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-white">
                                Brief Description
                            </Label>
                            <Textarea
                                id="description"
                                {...register('description')}
                                className={`bg-gray-700 border-gray-600 text-white min-h-[120px]
                  ${errors.description ? 'border-red-500 focus:border-red-500' : ''}`}
                                placeholder="Tell us a bit about your needs..."
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Submitting..." : "Submit Request"}
                        </Button>
                    </form>
                </Card>

                {/* Additional Info */}
                <div className="mt-8 text-center text-gray-400 text-sm">
                    <p>
                        Already have an account?{" "}
                        <a href="/login" className="text-emerald-500 hover:text-emerald-400">
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RequestAccessPage;