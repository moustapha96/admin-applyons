/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import * as Icon from 'react-feather'

import { MdAdd, MdDelete, MdDeleteOutline, MdEdit, MdKeyboardArrowRight } from "react-icons/md";
import client2 from '../../../assets/images/client/02.jpg'
import axiosInstance from "../../../services/api";
import { Breadcrumb, Button, message, Popconfirm, Space, Table } from "antd";
import teamMemberService from "../../../services/teamMemberService";
import { buildImageUrl } from "../../../utils/imageUtils";

const TeamMembersAdmin = () => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const fetchTeamMembers = async () => {
        try {
            setLoading(true);
            const response = await teamMemberService.getAll();
            console.log(response.teamMembers);
            setTeamMembers(response.teamMembers);
        } catch (error) {
            console.error("Erreur lors de la récupération des membres d'équipe:", error);
            message.error("Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    // Supprimer un membre d'équipe
    const handleDelete = async (id) => {
        try {
            await teamMemberService.delete(id);
            message.success("Membre supprimé avec succès");
            fetchTeamMembers(); // Rafraîchir la liste
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            message.error("Erreur lors de la suppression");
        }
    };


    // Colonnes du tableau
    const columns = [
        {
            title: "Nom",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Poste",
            dataIndex: "position",
            key: "position",
        },
        {
            title: "Bio",
            dataIndex: "bio",
            key: "bio",
            render: (text) => <div className="truncate max-w-xs">{text}</div>,
        },
        {
            title: "Ordre",
            dataIndex: "order",
            key: "order",
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="link"
                        icon={<MdEdit />}
                        onClick={() => navigate(`/admin/team-members/${record.id}/edit`)}
                    >
                        Modifier
                    </Button>
                    <Popconfirm
                        title="Êtes-vous sûr de vouloir supprimer ce membre ?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Oui"
                        cancelText="Non"
                    >
                        <Button type="link" danger icon={<MdDelete />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    useEffect(() => {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
    }, []);

    return (
        <div className="container-fluid relative px-3">
            <div className="layout-specing">
                <div className="md:flex justify-between items-center mb-6">
                    <h5 className="text-lg font-semibold">
                        Membres de l'équipe
                    </h5>
                    <Breadcrumb
                        items={[
                            { title: <Link to="/admin">Dashboard</Link> },
                            { title: "Membres de l'équipe" },
                        ]}
                    />
                </div>

                <div className="md:flex justify-end items-center">
                    <Button
                        type="primary"
                        icon={<MdAdd />}
                        onClick={() => navigate("/admin/team-members/create")}
                    >
                        Ajouter un membre
                    </Button>


                </div>

                <div className="bg-white dark:bg-slate-800 rounded-md shadow dark:shadow-gray-700 p-6">
                    <Table
                        columns={columns}
                        dataSource={teamMembers}
                        loading={loading}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 'auto' }}
                    />
                </div>

                {loading ? (
                    <div className="text-center py-10">Chargement...</div>
                ) : (
                    <div className="grid xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 mt-6 gap-6">
                        {teamMembers.map((member) => (
                            <div className="group text-center" key={member.id}>
                                <div className="relative inline-block mx-auto max-h-[208px] max-w-[208px] rounded-full overflow-hidden shadow-sm dark:shadow-gray-700">
                                    {member.photo ? (
                                        <img
                                            src={buildImageUrl(member.photo)}
                                            className="w-full h-full object-cover"
                                            alt={member.name}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">

                                            <img src={client2} alt="client2" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black max-h-[208px] max-w-[208px] rounded-full opacity-0 group-hover:opacity-100 duration-500"></div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 duration-500 space-x-2">
                                        <Link
                                            to={`/admin/team-members/${member.id}/edit`}
                                            className="size-9 inline-flex items-center justify-center tracking-wide align-middle
                                             duration-500 text-base text-center rounded-full border border-[var(--applyons-blue)] bg-[var(--applyons-blue)] hover:border-[var(--applyons-orange)] hover:bg-[var(--applyons-orange)] text-white"
                                        >
                                            <MdEdit className="size-5" />
                                        </Link>
                                        <Popconfirm
                                            title="Êtes-vous sûr de vouloir supprimer ce membre ?"
                                            onConfirm={() => handleDelete(member.id)}
                                            okText="Oui"
                                            cancelText="Non"
                                        >
                                            <Button
                                                danger
                                                className="size-9 inline-flex items-center justify-center tracking-wide align-middle duration-500 text-base text-center rounded-full border border-red-600 bg-red-600 hover:border-red-600 hover:bg-red-600 text-white"
                                            >
                                                <MdDeleteOutline className="size-15" />
                                            </Button>
                                        </Popconfirm>
                                    </div>
                                </div>
                                <div className="content mt-3">
                                    <Link
                                        to={`/admin/team-members/${member.id}/edit`}
                                        className="text-lg font-semibold hover:text-[var(--applyons-blue)] duration-500 block"
                                    >
                                        {member.name}
                                    </Link>
                                    <p className="text-slate-400">{member.position}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default TeamMembersAdmin;