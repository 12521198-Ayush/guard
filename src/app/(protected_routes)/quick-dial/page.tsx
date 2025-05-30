'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Phone, Mail, User2 } from "lucide-react";
import { Card, CardContent, Typography, CircularProgress, Box, Stack } from "@mui/material";
import { Button } from "antd";
import { useSession } from "next-auth/react";

interface Contact {
    _id: string;
    role: string;
    mobile: string;
    email: string;
}

const ImportantContactsList: React.FC = () => {
    const { data: session } = useSession();
    const premiseId = session?.user?.primary_premise_id;
    const accessToken = session?.user?.accessToken || '';

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchContacts = async () => {
            if (!premiseId || !accessToken) return;

            setLoading(true);
            try {
                const response = await axios.post(
                    "http://139.84.166.124:8060/user-service/misc/important_contacts/read",
                    { premise_id: premiseId },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
                setContacts(response.data?.data || []);
            } catch (error) {
                console.error("Error fetching contacts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, [accessToken, premiseId]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <div className="bg-white p-3 font-sans relative ">
                <div className="p-4 space-y-4 max-w-md mx-auto">
                    <div className="flex justify-center mb-6 ">
                        <h2 className="text-lg font-semibold text-gray-700"> Important Contacts</h2>
                    </div>
                </div>
                <div className="space-y-4 overflow-y-auto pb-20" style={{ maxHeight: '75vh' }}>
                    <Stack spacing={2}>
                        {contacts.map((item) => (
                            <Card
                                key={item._id}
                                variant="outlined"
                                sx={{
                                    border: "none",
                                    boxShadow: "0px 2px 10px rgba(0,0,0,0.06)",
                                    borderRadius: 3,
                                    backgroundColor: "#f9f9f9",
                                }}
                            >
                                <CardContent>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {item.role}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Phone: {item.mobile}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Email: {item.email !== "-" ? item.email : "N/A"}
                                    </Typography>

                                    <Box mt={2}>
                                        <a href={`tel:${item.mobile}`} style={{ textDecoration: "none" }}>
                                            <Button
                                                type="primary"
                                                icon={<Phone size={16} />}
                                                style={{
                                                    backgroundColor: "#4CAF50",
                                                    borderColor: "#4CAF50",
                                                    borderRadius: 8,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                }}
                                            >
                                                Call
                                            </Button>
                                        </a>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </div>
            </div>
        </Box>
    );
};

export default ImportantContactsList;
